<<<<<<< HEAD
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /productivity-service .

FROM alpine:3.19
COPY --from=build /productivity-service /productivity-service
EXPOSE 8080
CMD ["/productivity-service"]
=======
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
