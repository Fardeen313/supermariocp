FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY ./mario-game/ .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

