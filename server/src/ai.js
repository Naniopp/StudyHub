import { z } from 'zod';

const shape = z.object({
  questions: z.array(z.object({
    question: z.string().min(8).max(1500),
    options: z.array(z.string().min(1).max(500)).length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().min(4).max(2000),
  })),
});

const norm = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const invalidOutput = () => Object.assign(
  new Error('AI returned repeated or invalid questions. Please try again.'),
  { status: 502, code: 'AI_INVALID_OUTPUT' },
);

function validateQuestions(content, count, previous) {
  let payload;
  try {
    payload = JSON.parse(content || '{}');
  } catch {
    throw invalidOutput();
  }

  const parsed = shape.safeParse(payload);
  if (!parsed.success || parsed.data.questions.length !== count) throw invalidOutput();

  const seen = new Set(previous.map(norm));
  return parsed.data.questions.map((question, index) => {
    const fingerprint = norm(question.question);
    if (new Set(question.options.map(norm)).size !== 4 || seen.has(fingerprint)) throw invalidOutput();
    seen.add(fingerprint);
    return {
      id: `q${index + 1}`,
      text: question.question,
      options: question.options.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
      correctOptionId: `o${question.answer + 1}`,
      explanation: question.explanation,
      fingerprint,
    };
  });
}

export async function generateQuestions({ subject, topic, difficulty, count, previous = [] }) {
  if (!process.env.AI_API_KEY) {
    throw Object.assign(new Error('AI quiz generation is unavailable. Configure AI_API_KEY on the server.'), { status: 503 });
  }

  const priorQuestions = previous.slice(0, 40);
  const messages = [
    {
      role: 'system',
      content: 'Return JSON only: {"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}. Generate original educational multiple choice questions. Every question must be unique within this response and different from every question in the avoid list. Give each question exactly four distinct options and one correct answer index. No markdown.',
    },
    {
      role: 'user',
      content: `Generate ${count} ${difficulty} questions on ${topic}, subject ${subject}. Do not repeat or lightly reword any question in this avoid list: ${priorQuestions.join(' | ')}`,
    },
  ];

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const response = await fetch(process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          temperature: 0.8,
          max_tokens: Math.min(5000, count * 350),
          response_format: { type: 'json_object' },
          messages,
        }),
      });

      if (!response.ok) {
        throw Object.assign(
          new Error(response.status === 429 ? 'AI provider is busy. Try again shortly.' : 'AI provider could not generate this quiz.'),
          { status: response.status === 429 ? 429 : 502 },
        );
      }

      const payload = await response.json();
      try {
        return validateQuestions(payload.choices?.[0]?.message?.content, count, previous);
      } catch (error) {
        if (error.code !== 'AI_INVALID_OUTPUT' || attempt === 1) throw error;
        messages.push({
          role: 'assistant',
          content: payload.choices?.[0]?.message?.content || '{}',
        });
        messages.push({
          role: 'user',
          content: 'That response had repeated questions or invalid options. Generate a completely different, valid set. Return exactly the requested number of unique questions with four distinct options each.',
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw Object.assign(new Error('Quiz generation timed out. Try again.'), { status: 504 });
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw invalidOutput();
}
