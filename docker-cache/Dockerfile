
FROM node:18-alpine

WORKDIR /dcarbon-web
COPY . . 

RUN yarn &&\
    yarn cache clean &&\ 
    echo "Build dcarbon-web-cms cache success...!"

