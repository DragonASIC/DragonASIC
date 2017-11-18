FROM ubuntu:xenial-20170915
MAINTAINER Koki Takahashi <hakatasiloving@gmail.com>

RUN sed -i.bak -e "s%http://archive.ubuntu.com/ubuntu/%http://ftp.jaist.ac.jp/pub/Linux/ubuntu/%g" /etc/apt/sources.list

RUN apt update -y && \
    apt upgrade -y && \
    apt install -y software-properties-common

RUN add-apt-repository ppa:saltmakrell/ppa

RUN apt update -y && \
    apt install -y git clang csh cmake m4 yosys libgsl-dev pkg-config libx11-dev tk-dev tcsh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install magic
# TODO: qflowのビルド時に認識されてないっぽいのでなんとかする
RUN cd /root && \
    git clone --depth 1 git://opencircuitdesign.com/magic-8.1 && \
    cd magic-8.1 && \
    ./configure && \
    make && \
    make install

# Install graywolf
RUN cd /root && \
    git clone --depth 1 https://github.com/rubund/graywolf && \
    cd graywolf && \
    cmake . && \
    make > /dev/null && \
    make install

# Install qrouter
RUN cd /root && \
    git clone --depth 1 git://opencircuitdesign.com/qrouter-1.3 && \
    cd qrouter-1.3 && \
    ./configure && \
    make && \
    make install

# Install QFlow
RUN cd /root && \
    git clone --depth 1 git://opencircuitdesign.com/qflow-1.1 && \
    cd qflow-1.1 && \
    ./configure && \
    make && \
    make install

WORKDIR /root

CMD ["qflow"]
