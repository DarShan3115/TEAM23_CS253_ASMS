# Use the official Golang image that matches our go.mod version
FROM golang:1.25-alpine AS build

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

# Copy dependency files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o main .

# Final stage: minimal runtime image
FROM alpine:latest
RUN apk add --no-cache ca-certificates

WORKDIR /root/
COPY --from=build /app/main .

EXPOSE 8080

CMD ["./main"]