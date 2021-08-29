FROM nginx:stable-alpine

COPY dist/ /usr/share/nginx/html/

# then, mount with volume
# docker volume create
# docker build -t emr-web .
#
# checke private.json desn't included in /usr/share/nginx/html/emr/
# docker run -p 8889:80 --name emr --rm -it 5ef /bin/sh
# URL: http://192.168.0.201:8889
#
# set configuration in dist/private.json
# docker volume create private.json
# sudo cp dist/private.json /var/lib/docker/volumes/private.json/_data/
#
# start with volume
# docker run --mount source=private.json,target=/usr/share/nginx/html/dist -p 8889:80 --name emr --rm -d eb7
