FROM node:alpine
RUN apk update
RUN  apk add poppler-data
RUN  apk add poppler-utils
RUN echo $PATH
COPY package*.json /
RUN npm install 
COPY ./ ./
EXPOSE 8080
CMD npm start