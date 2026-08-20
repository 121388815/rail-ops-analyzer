FROM node:24-alpine AS web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.13-slim
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/app ./app
COPY --from=web /app/frontend/dist ./static
ENV PORT=10000
ENV STATIC_DIR=/app/static
EXPOSE 10000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}

