# syntax=docker/dockerfile:1
# ── Build Stage ────────────────────────────────────────────────────────────────
# Using stable Go 1.24 (1.25 does not exist — caused slow/failed pulls)
FROM golang:1.24-alpine AS build

WORKDIR /app

# Copy dependency manifests first — changes to source won't bust this layer
COPY go.mod go.sum ./

# Download modules into a persistent BuildKit cache mount.
# On subsequent builds this is a cache-hit: near-instant, no network traffic.
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy source code
COPY . .

# Build with:
#   - Persistent build cache (GOCACHE) via cache mount → incremental recompilation
#   - CGO disabled for a fully static binary
#   - -ldflags="-s -w" strips debug symbols → smaller binary, faster link step
#   - -trimpath removes local file paths from binary
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
      -ldflags="-s -w" \
      -trimpath \
      -o main .

# ── Final Stage (Minimal Image) ────────────────────────────────────────────────
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=build /app/main .

EXPOSE 8080

CMD ["./main"]