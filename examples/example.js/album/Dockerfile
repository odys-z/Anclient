FROM nginx:stable-alpine

COPY dist/* /usr/share/nginx/html/

# docker doesn't copy parent directory
# mkdir products
# cp ../../../../ever/products/album-web/index.html products
COPY products/index.html /usr/share/nginx/html/

# then, mount with volume
# ./docker-webstart