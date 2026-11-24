# resuMetric

resuMetric is a full-stack interview preparation app that analyzes a job description and a candidate profile to create a personalized interview strategy.

## Features

- User registration, login, logout, and protected routes
- Upload a PDF resume or provide a quick self-description
- AI-generated technical and behavioral interview questions
- Match score and identified skill gaps
- Day-by-day preparation roadmap
- Download an optimized resume as a PDF
- Saved interview plans for each user

## Tech stack

- Frontend: React 19, Vite, React Router, Axios, Sass
- Backend: Node.js, Express, MongoDB, Mongoose
- AI: Google Gemini via `@google/genai`
- Authentication: JWT stored in an HTTP-only cookie

## Project structure

```text
.
├── Backend/     # Express API and MongoDB integration
└── Frontend/    # React + Vite client
```

## Prerequisites

- Node.js 22 or newer (Node 22 or 24)
- MongoDB database
- Google Gemini API key

## Getting started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd interview-ai-yt
```

### 2. Configure the backend

Copy `Backend/.env.example` to `Backend/.env` and set:

```env
MONGO_URI=mongodb://127.0.0.1:27017/resumetric
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_GENAI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash
```

`GEMINI_API_KEY` can be used instead of `GOOGLE_GENAI_API_KEY` if preferred.

### 3. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 4. Start the application

Open two terminals from the repository root.

Backend:

```bash
cd Backend
npm run dev
```

Frontend:

```bash
cd Frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173). The API runs on [http://localhost:3000](http://localhost:3000).

### Deploy with Vercel, Render, and MongoDB Atlas

1. Push this repository to GitHub.
2. Create a MongoDB Atlas cluster and a database user. Copy the application's MongoDB connection string; use it for `MONGO_URI` on Render. Add the Render service's outbound IP ranges to the Atlas IP access list after creating the Render service.
3. Create a Render Web Service from this repository with root directory `Backend`, build command `npm ci`, and start command `npm start`. Set `NODE_VERSION` to `24.22.1` (the backend also supports Node 22).
4. Add these Render environment variables: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `GOOGLE_GENAI_API_KEY`, and `GEMINI_MODEL=gemini-3.5-flash`. Set Render's health check path to `/health`.
5. After Render deploys, copy its service URL into the API rewrite destination in `Frontend/vercel.json` (replace `YOUR-RENDER-SERVICE`).
6. Create a Vercel project from the same repository with root directory `Frontend`. Use the Vite defaults (`npm run build`, output directory `dist`). Leave `VITE_API_URL` unset in Vercel; production requests use the same-origin `/api` rewrite.
7. Once Vercel gives you the production URL, set that exact origin as Render's `FRONTEND_URL` and redeploy the backend.

Keep `MONGO_URI`, `JWT_SECRET`, and `GOOGLE_GENAI_API_KEY` only in Render's environment settings. Leave `VITE_API_URL` unset on Vercel so the frontend uses the same-origin API proxy; the variable is useful for local development or a different hosting setup.

## Available scripts

### Frontend

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

### Backend

```bash
npm run dev      # Start the API with Nodemon
```

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/get-me` | Get the current user |
| `GET` | `/api/auth/logout` | Sign out |
| `POST` | `/api/interview/` | Generate an interview plan |
| `GET` | `/api/interview/` | List saved plans |
| `GET` | `/api/interview/report/:interviewId` | Get a saved plan |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Download a tailored resume PDF |

## Notes

- Resume uploads must be PDF files no larger than 5 MB.
- The frontend expects the backend at `http://localhost:3000`.
- Keep API keys and JWT secrets in `.env`; do not commit them to GitHub.

## License

This project is currently unlicensed. Add a license before distributing it publicly.
