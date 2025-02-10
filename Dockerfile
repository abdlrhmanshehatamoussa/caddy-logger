FROM node:18

WORKDIR /app

COPY index.js app.js storage.js package*.json ./

RUN npm install

EXPOSE 3000
EXPOSE 3001

CMD ["node", "index.js"]