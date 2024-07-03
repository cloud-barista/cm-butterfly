# Stage1: Build butterfly binary
FROM golang:1.19-alpine AS builder

RUN apk update
RUN apk add --no-cache bash git gcc


WORKDIR /go/src/github.com/cloud-barista/cm-butterfly 
COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o butterfly main.go

# Stage2: Execution butterfly binary
FROM alpine:latest as prod

WORKDIR /app

COPY --from=builder /go/src/github.com/cloud-barista/cm-butterfly/src /app/src
COPY --from=builder /go/src/github.com/cloud-barista/cm-butterfly/conf /app/conf
COPY --from=builder /go/src/github.com/cloud-barista/cm-butterfly/butterfly /app/butterfly
COPY --from=builder /go/src/github.com/cloud-barista/cm-butterfly/docker_entrypoint.sh /app/docker_entrypoint.sh

RUN chmod +x docker_entrypoint.sh butterfly

EXPOSE 1234

ENTRYPOINT ["./docker_entrypoint.sh"]
