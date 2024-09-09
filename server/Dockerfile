FROM docker.io/node:latest
RUN mkdir /app /music
COPY ./ /app/
WORKDIR /app
RUN npm install
CMD npm start
