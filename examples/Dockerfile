FROM nginx:stable-alpine

COPY example.js/cdn-cache/ /usr/share/nginx/html/cdn-cache/
COPY example.js/common-pkgs/ /usr/share/nginx/html/common-pkgs/
COPY example.js/plain-quiz/ /usr/share/nginx/html/plain-quiz/

COPY example.js/react-quiz/dist/ /usr/share/nginx/html/react-quiz/

COPY example.js/x-visual/assets/ /usr/share/nginx/html/x-visual/assets/
COPY example.js/x-visual/bar-chart/docker.html /usr/share/nginx/html/x-visual/bar-chart/
COPY example.js/x-visual/dist/* /usr/share/nginx/html/x-visual/dist/
COPY example.js/node_modules/x-visual/dist/xv-* /usr/share/nginx/html/x-visual/dist/

COPY example.cs/file.upload/Anclient.upload-0.3.zip /usr/share/nginx/html/downloads/
COPY index.html /usr/share/nginx/html/
