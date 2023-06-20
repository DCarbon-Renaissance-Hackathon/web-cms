FROM harbor.viet-tin.com/dcarbon/web-cms:cache
WORKDIR /dcarbon-web
COPY . . 

ENV UPLOADS_PATH=/var/lib/dc-public
RUN yarn build &&\ 
    yarn cache clean &&\ 
    echo "Build wokr-cms success...!"
CMD [ "yarn", "start" ]