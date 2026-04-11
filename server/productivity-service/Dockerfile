# Step 1: Build Stage
FROM golang:1.25-alpine AS build

# No need for gcc/musl-dev if we disable CGO
WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Step 2: Final Stage (Minimal Image)
FROM alpine:latest
RUN apk add --no-cache ca-certificates

WORKDIR /root/
COPY --from=build /app/main .

EXPOSE 8080

CMD ["./main"]