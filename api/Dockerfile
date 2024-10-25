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

WORKDIR /app

COPY --from=build /src/cm-butterfly/ .


ENV API_ADDR=${API_ADDR:-0.0.0.0}
ENV API_PORT=${API_PORT:-4000}
ENV USER_AUTH_DATA_PATH=${USER_AUTH_DATA_PATH:-conf/user.dat}
ENV USER_AUTH_CONF_PATH=${USER_AUTH_CONF_PATH:-conf/authsetting.yaml}
ENV MENU_CONF_DATA_PATH=${MENU_CONF_DATA_PATH:-conf/menu.yaml}

ENV POSTGRES_USER=${POSTGRES_USER:-butterflyadmin}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-pw123butterflyadmin}
ENV POSTGRES_DATABASE_HOST=${POSTGRES_DATABASE_HOST:-cm-butterfly-db}
ENV POSTGRES_DB=${POSTGRES_DB:-butterfly-db}

EXPOSE 4000

CMD bash -c 'until /app/api migrate; do echo "Migration failed. Retrying in 10 seconds..."; sleep 10; done; /app/api > /app/api.log 2>&1 &  tail -f /app/api.log & wait'