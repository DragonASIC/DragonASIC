<div align="center">
  <a href="https://github.com/DragonASIC/DragonASIC">
    <img width="80%" vspace="" hspace="25"
      src="https://i.imgur.com/kjcqW4M.png">
  </a>
  <p>Lay your ASIC out on the Web!!<p>
</div>

[未踏2017][mitou]採択プロジェクト[「GUIによるカスタムマイコン設計プラットフォーム」][project]

[mitou]: https://www.ipa.go.jp/jinzai/mitou/2017/
[project]: https://www.ipa.go.jp/jinzai/mitou/2017/gaiyou_f-1.html

## Prerequisites

* [Node.js](https://nodejs.org/en/) v9
* Docker

## Install

```sh
cd /path/to/DragonASIC
git submodule update --init --recursive
npm install
docker-compose build
docker-compose run compiler make COMMONFLAGS=-Wall CC=clang out/8cc out/elc
npm run build:web
```

## Start Server

```sh
npm run dev
```

The site will be up on http://localhost:8080/

## Build flow

```sh
# compile
docker-compose run compiler ./out/8cc -S -o out/gpio.c.eir test/gpio.c
docker-compose run compiler ./out/elc -trsq out/gpio.c.eir > cpu/gpio.asm

# assemble
docker-compose run assembler python tools/Assembler/assembler.py gpio.asm

# layout
docker-compose run qflow ???
```
