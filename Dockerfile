FROM golang:1.21-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/ .
RUN go mod tidy
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/proxypoolhub .

FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM alpine:latest

WORKDIR /app

COPY --from=backend-builder /app/proxypoolhub /app/
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 3000 8080 1080

CMD ["/app/proxypoolhub"]
