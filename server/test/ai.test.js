import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestions } from '../src/ai.js';

test('quiz generation fails clearly when the AI key is missing', async () => {
  const prior = process.env.AI_API_KEY;
  delete process.env.AI_API_KEY;
  try {
    await assert.rejects(generateQuestions({ subject: 'Science', topic: 'Cells', difficulty: 'easy', count: 5 }), /Configure AI_API_KEY/);
  } finally {
    if (prior !== undefined) process.env.AI_API_KEY = prior;
  }
});
