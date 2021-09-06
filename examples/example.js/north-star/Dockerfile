FROM nginx:stable-alpine

COPY dist/ /usr/share/nginx/html/

# then, mount with volume
# (docker volume create)
# docker build -t emr-web .
#
# check the private/host.json didn't been included in /usr/share/nginx/html/
# docker run -p 8889:80 --name emr --rm -it 5ef /bin/sh
# URL: http://192.168.0.201:8889
#
# setup configuration of dist/private/host.json
# docker volume create private.host
# sudo cp dist/private/host.json /var/lib/docker/volumes/private.host/_data/
#
# start with volume mounted as "private.host" - the volume name
# docker run --mount source=private.host,target=/usr/share/nginx/html -p 8889:80 --name emr --rm -d eb7
