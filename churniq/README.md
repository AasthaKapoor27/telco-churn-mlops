# ChurnIQ — Run Instructions

## Backend only (no Docker)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Full stack with Docker Compose
```bash
docker compose up --build
```
- Frontend → http://localhost:3000
- Backend  → http://localhost:8000
- API docs → http://localhost:8000/docs

## Backend Docker only
```bash
cd backend
docker build -t churniq-api .
docker run -d --name churniq-api -p 8000:8000 churniq-api
```

## Test the API
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"tenure":6,"MonthlyCharges":85.5,"Contract":"Month-to-month",
       "InternetService":"Fiber optic","PaymentMethod":"Electronic check",
       "SeniorCitizen":0,"Partner":"No","Dependents":"No"}'
```

## Plug in your trained model
```bash
cp /path/to/model.pkl   backend/model.pkl
cp /path/to/columns.pkl backend/columns.pkl
docker compose up --build --force-recreate backend
```

## Notes
- The backend runs in **mock (heuristic) mode** if `model.pkl` is absent — it never crashes.
- Set `VITE_API_URL` in the frontend Docker build to point at a remote backend.
- The Swagger UI is available at `/docs` on the backend port.
