FROM node:23

ENV APP_HOME /app
WORKDIR $APP_HOME

COPY package.json package-lock.json .
RUN npm install -f

ADD . $APP_HOME
RUN npm run build

CMD [ "npm", "start" ]
