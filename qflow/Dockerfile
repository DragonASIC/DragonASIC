FROM alpine:3.6

RUN apk update && \
    apk upgrade && \
    apk add --update git clang cmake musl-dev m4 make ncurses-dev

RUN apk add --update gcc

# Install csh
RUN cd /root && \
    git clone --depth 1 https://github.com/tcsh-org/tcsh.git && \
    cd tcsh && \
    ./configure && \
    make && \
    make install

RUN cd /root && \
    git clone --depth 1 git://opencircuitdesign.com/magic-8.1 && \
    cd magic-8.1 && \
    sed -i -e 's/#!\/bin\/csh -f/#!\/usr\/bin\/env tcsh/' scripts/makedbh && \
    ./configure && \
    make

WORKDIR /

CMD ["qflow"]
