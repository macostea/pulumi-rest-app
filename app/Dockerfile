FROM node:16-alpine

WORKDIR /app
ADD package.json .
ADD package-lock.json .

RUN npm install

ADD . .
RUN npm run build

CMD ["npm", "start"]
