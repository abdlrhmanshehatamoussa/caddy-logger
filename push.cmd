@echo off
set /P version=Enter version:
docker build . -t caddy-logger:%version%
docker tag caddy-logger:%version% abdlrhmanshehata/caddy-logger:%version%
docker push abdlrhmanshehata/caddy-logger:%version%