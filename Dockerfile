FROM node:14-slim

# Brauzerlar uchun kerakli kutubxonalarni o‘rnatish
RUN apt-get update && apt-get install -y chromium

# Ishchi papkani yaratish va unga kodni nusxalash
WORKDIR /app
COPY . /app

# NPM paketlarini o‘rnatish
RUN npm install

# Asosiy Node.js skriptni ishga tushirish
CMD ["node", "index.js"]
