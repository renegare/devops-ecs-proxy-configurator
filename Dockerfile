FROM mhart/alpine-node:4

ENV DEBUG *
ENV NODE_ENV production

WORKDIR /app

ADD package.json ./package.json

RUN npm install

ADD src /app/src
ADD server.js /app/server.js
ADD VERSION /app/VERSION

EXPOSE 3000

CMD ["npm", "start"]
