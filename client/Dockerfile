FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We specify the command in docker-compose, not here.
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]