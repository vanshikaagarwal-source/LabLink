# LabLink — Smart University Laboratory Resource-Sharing Platform

**One Campus. Every Lab. Smarter Access.** Generic university demo. All data is illustrative sample data.

## Run locally
```bash
npm install
npm install -D vitest@^2      # first time only
npm run dev                   # http://localhost:5173
npm test                      # FairSlot unit tests
npm run build && npm start    # production server on http://localhost:8080
```

## FairSlot
`P = 0.5U + 0.3F + 0.2N` — U: deadline urgency, F: fairness (less recent usage → higher), N: project need (all 0–100).
1. Infeasible requests (invalid input, maintenance, past deadline, fully booked, student clash) are **never ranked**.
2. Feasible requests are ranked by P; ties → earlier deadline → earlier submission.
3. Seats are allocated up to equipment capacity; others get compatible equipment (same category) or the next free slot.
4. Every decision includes an explanation. **Faculty make the final approval.**

Code: `src/services/fairslot.ts`, `src/services/booking.ts`, tests in `src/services/fairslot.test.ts`.

## Deploy to Google Cloud Run
```bash
gcloud run deploy lablink --source . --region asia-south1 --allow-unauthenticated
```
The container listens on `$PORT` and `0.0.0.0` (`server.mjs`). Health check: `/healthz`.
No API keys are used in the frontend. Future Gemini keys belong in Secret Manager, never in the repo.
