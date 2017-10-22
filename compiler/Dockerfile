FROM frolvlad/alpine-glibc

RUN apk update && \
    apk upgrade && \
    apk add --update clang && \
    rm -rf /var/cache/apk/*

WORKDIR /root
