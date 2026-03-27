<<<<<<< HEAD
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
=======
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
