FROM nginx:stable-alpine

COPY example.js/cdn-cache/ /usr/share/nginx/html/cdn-cache/

COPY example.js/react-quiz/dist/ /usr/share/nginx/html/react-quiz/

COPY example.js/xvisual/assets/ /usr/share/nginx/html/xvisual/assets/
COPY example.js/xvisual/bar-chart/docker.html /usr/share/nginx/html/xvisual/bar-chart/
COPY example.js/xvisual/dist/* /usr/share/nginx/html/xvisual/dist/
COPY example.js/node_modules/x-visual/dist/xv-* /usr/share/nginx/html/xvisual/dist/

COPY example.cs/file.upload/Anclient.upload-0.3.zip /usr/share/nginx/html/downloads/
COPY index.html /usr/share/nginx/html/
