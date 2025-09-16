# Используем официальный образ Node.js
FROM node:22-alpine

# Устанавливаем рабочую директорию
WORKDIR /app


# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install 
## --legacy-peer-deps
# Копируем исходный код
COPY . .
ARG API_PROXY_URL
ENV API_PROXY_URL=$API_PROXY_URL
# Собираем приложение
RUN npx next build

# Порт, который будет использовать приложение
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "start"]