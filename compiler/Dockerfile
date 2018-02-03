FROM frolvlad/alpine-glibc

RUN apk update && \
    apk upgrade && \
    apk add --update make gcc musl-dev && \
    rm -rf /var/cache/apk/*
    
RUN mkdir -p /elvm

WORKDIR /elvm
