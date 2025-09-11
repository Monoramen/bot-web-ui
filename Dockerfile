# Используем официальный образ Node.js
FROM node:22-alpine

# Устанавливаем рабочую директорию
WORKDIR /trm-251-firing-manager

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install 
## --legacy-peer-deps
# Копируем исходный код
COPY . .

# Собираем приложение
RUN npx next build

# Порт, который будет использовать приложение
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "start"]