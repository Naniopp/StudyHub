# Deployment

The included [Render Blueprint](../render.yaml) deploys the React frontend and Express API as one HTTPS web service. Serving both from the same origin keeps the session cookie first-party and avoids cross-site cookie configuration. The production frontend calls `/api` on that origin; local development keeps using the API on port 5000.

## Deploy on Render

1. Push this repository to a Git provider and create a Render account.
2. In Render, choose **New → Blueprint**, connect the repository, and apply `render.yaml`. The service is named `socialhub`.
3. Before the service can become fully functional, provide `MONGODB_URI` and a **newly rotated** `AI_API_KEY` in the service's **Environment** settings. The Blueprint uses the project's Groq-compatible endpoint and model by default. Use a MongoDB Atlas URI with the database name `socialhub`, shaped like `mongodb+srv://<DATABASE_USER>:<URL_ENCODED_PASSWORD>@<YOUR_ATLAS_CLUSTER>/socialhub?retryWrites=true&w=majority&appName=SocialHub`. Replace the placeholders with Atlas's cluster host and a database user; percent-encode special characters in the password. The Blueprint generates `SESSION_SECRET`. If using another OpenAI-compatible provider, change `AI_BASE_URL` and `AI_MODEL` to that provider's supported values.
4. In Atlas, create a dedicated database user for this app and allow the deployed Render service to reach the cluster. Do not use a local-only MongoDB URI such as `mongodb://127.0.0.1:27017/...`; that address would refer to the Render container, not your computer.
5. Wait for the deployment to become healthy. Verify the service's `/api/health` endpoint returns `{"status":"ok"}`, then register an account and exercise tasks, quizzes, and history using the [manual checklist](./MANUAL-CHECKLIST.md).

Keep database and AI credentials in Render's environment settings, never in source control. The Render free web service may sleep when idle; its first request after inactivity can be delayed. MongoDB Atlas is separately provisioned and stores app data and sessions; the deployment does not rely on an ephemeral local database.

## Other hosting arrangements

For separate frontend and API hosts, set `VITE_API_URL` at frontend build time and `CLIENT_URL` to the exact frontend origin on the API. This project currently uses `SameSite=Lax` session cookies; cross-site frontend/API hosts need a deliberate cookie and CSRF design before deployment. Prefer the single-origin setup above unless you are prepared to configure and validate that arrangement.
