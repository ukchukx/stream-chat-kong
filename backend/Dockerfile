FROM node:carbon-alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 10000

CMD ["npm", "start"]
