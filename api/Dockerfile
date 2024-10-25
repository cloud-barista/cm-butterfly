## Stage 1 - Go Build Env
FROM golang:1.23-alpine AS build

RUN apk add --no-cache gcc libc-dev musl-dev curl npm wget

RUN mkdir -p /util
WORKDIR /util
RUN wget https://github.com/gobuffalo/cli/releases/download/v0.18.14/buffalo_0.18.14_Linux_x86_64.tar.gz \
    && tar -xvzf buffalo_0.18.14_Linux_x86_64.tar.gz \
    && mv buffalo /usr/local/bin/buffalo \
    && rm buffalo_0.18.14_Linux_x86_64.tar.gz

ENV GOPROXY http://proxy.golang.org
ENV CGO_ENABLED=1

RUN mkdir -p /src/cm-butterfly
WORKDIR /src/cm-butterfly
ADD . .

RUN go mod download
RUN buffalo build --static -o /src/cm-butterfly/api

## Stage 2 - Application Deploy
FROM debian:buster-slim as deploy

COPY --from=build /src/cm-butterfly/ .

ENV API_ADDR=0.0.0.0\
    API_PORT=4000\
    USER_AUTH_DATA_PATH=conf/user.dat \
    USER_AUTH_CONF_PATH=conf/authsetting.yaml\
    MENU_CONF_DATA_PATH=conf/menu.yaml

EXPOSE 4000

CMD bash -c 'until /api migrate; do echo "Migration failed. Retrying in 10 seconds..."; sleep 10; done; /api > /api.log 2>&1 &  tail -f /api.log & wait'