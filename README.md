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
npm install
docker build qflow -t qflow
```

## Start Server

```sh
npm run dev
```

The site will be up on http://localhost:8080/
