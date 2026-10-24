# MongoDB models

- **User**: normalized unique email, name, bcrypt password hash (excluded by default), theme preference, timestamps.
- **Task** (`tasks`): user reference, title, optional description/due date, pending/completed state, priority, completion time, timestamps. Index supports owner/status/due-date queries.
- **Quiz** (`quizzes`): user reference, subject/topic/difficulty, private embedded questions and answer keys, selected answers, server-computed score/counts/accuracy, submission and creation times. Index supports owner history queries. Active response serialization excludes answer keys and explanations.
- **Session** (`sessions`): connect-mongo session collection; opaque session ID cookie, no raw session secret in user records.

Local development points to `mongodb://127.0.0.1:27017/studyhub`. On server startup, the app creates the `users`, `tasks`, `quizzes`, and `sessions` collections when missing, then ensures model indexes exist. This keeps application data in one named local database; Atlas is only used if its URI is explicitly configured.

Each task and quiz read/write query includes the authenticated `userId`. Quiz fingerprints are normalized and checked against at most the latest 15 saved attempts during generation. This is bounded exact matching and reduces repeats, but does not guarantee semantic uniqueness.
