# REST API reference

Base path: `/api`. JSON bodies. Authenticated routes use the `studyhub.sid` HTTP-only cookie. Error body: `{ "error": "message" }`.

| Method and path | Auth | Body / query | Result |
|---|---|---|---|
| GET `/health` | No | — | `{status:"ok"}` |
| POST `/auth/register` | No | name, email, password (10+ chars, letter and number) | 201 user DTO + session; 409 duplicate |
| POST `/auth/login` | No | email, password | user DTO + session; 401 generic credential error |
| POST `/auth/logout` | No | — | 204 and session invalidation |
| GET `/auth/me` | Yes | — | user DTO |
| PATCH `/auth/me` | Yes | name and/or themePreference | updated user DTO; fields are allow-listed |
| GET `/tasks` | Yes | status, priority, search, page, limit | tasks and pagination metadata |
| POST `/tasks` | Yes | title, description, status, priority, dueDate | 201 task owned by current user |
| GET `/tasks/:id` | Yes | — | owned task; 404 otherwise |
| PATCH `/tasks/:id` | Yes | partial task fields | updated owned task; completion timestamp maintained |
| DELETE `/tasks/:id` | Yes | — | 204; 404 if missing/not owned |
| POST `/quizzes/generate` | Yes | subject, topic, difficulty, count (5/10/15) | 201 active quiz; AI errors return recoverable status |
| GET `/quizzes` | Yes | optional subject | completed quiz DTO list |
| GET `/quizzes/:id` | Yes | — | active DTO hides key/explanation; submitted DTO reveals review |
| POST `/quizzes/:id/submit` | Yes | answers map question IDs to option IDs | server-scored result; 409 duplicate submit |
| GET `/analytics/overview` | Yes | — | task totals and recent quiz summary |
| GET `/analytics/subjects` | Yes | — | subject accuracy aggregate |

IDs are always scoped to the session user. Invalid request schemas return 400. Authentication failures return 401. Unknown or unowned records return 404.
