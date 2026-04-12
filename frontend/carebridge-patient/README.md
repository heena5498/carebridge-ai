# CareBridge AI — Patient Care Transition Portal

A patient-facing care portal built with React 18, React Router v6, and Tailwind CSS.

## Local development

```bash
npm install
npm start
```

Create a `.env` file first:

```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Docker

**Build and run with Docker Compose (recommended):**

```bash
# .env file is read automatically at build time
docker compose up --build
```

App is served at `http://localhost:3000`.

**Or build/run manually:**

```bash
docker build \
  --build-arg REACT_APP_GEMINI_API_KEY=your_key_here \
  -t carebridge-patient .

docker run -p 3000:80 carebridge-patient
```

> **Note:** `REACT_APP_*` variables are baked into the bundle at build time by Create React App. The key is embedded in the static JS — never use a production secret here. In production, proxy AI calls through a backend server instead.

## Login credentials (demo)

- Email: `margaret@carebridge.com`
- Password: `password123`

## Project Structure

```
frontend/carebridge-patient/
  src/
    components/
      tabs/
        CarePlansTab.jsx    — Tab 1: care history with inline detail panel
        MedicationsTab.jsx  — Tab 2: all medications grouped by care plan
        FollowUpTab.jsx     — Tab 3: follow-up plan with action items
        ChatTab.jsx         — Tab 4: AI chat (Gemini API)
      CarePlanCard.jsx      — Clickable care plan card
      DetailPanel.jsx       — Inline expanded detail with 3 inner tabs
      FollowUpItem.jsx      — Single follow-up row
      MainTabs.jsx          — 4-tab navigation bar
      MedicationRow.jsx     — Single medication row
      NavBar.jsx            — Sticky top navigation
      StatCard.jsx          — Summary stat card
      StatusBadge.jsx       — Reusable status badge
    data/
      patientData.js        — All mock patient data
    hooks/
      useChat.js            — Chat state + Gemini API integration
    pages/
      LoginPage.jsx         — Authentication page
      PatientHome.jsx       — Main app shell
  Dockerfile                — Multi-stage build (Node → nginx)
  nginx.conf                — SPA routing + gzip + static caching
  docker-compose.yml        — Local container setup
  .dockerignore
```
