# tianjia_server

Api service of TianJia air controll project

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

注意：默认忽略了本地和生产两个环境的数据库账号及密码配置，开发前需在 config 文件夹下新建 config.local.js(本地开发)和 config.prod.js(生产)两个文件并填入数据库配置
