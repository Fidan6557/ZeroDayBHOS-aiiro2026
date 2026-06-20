FROM python:3.12-slim

WORKDIR /app

COPY src/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY src/backend/app ./app
COPY data ./sample-data

RUN mkdir -p /app/data

ENV DATABASE_URL=sqlite:////app/data/agentshield.db

EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
