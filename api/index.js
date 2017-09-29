const Koa = require('koa');
const {get, post} = require('koa-route');
const logger = require('koa-logger');
const cors = require('kcors');
const Docker = require('dockerode');
const tmp = require('tmp');
const {blue, green} = require('colors/safe');

const docker = new Docker();

const app = new Koa();

app.use(logger());
app.use(cors({
	origin: '*', // FIXME
	allowMethods: 'GET,POST',
	credentials: true,
}));

app.use(get('/', (context) => {
	context.body = 'Hello, World!';
}));

app.use(post('/generate', (context) => {
	context.body = {data: 'hoge'};
}));

const port = parseInt(process.env.PORT) || 3000;
app.listen(port);

console.log(`${blue('LOG')} DragonASIC API server listening port ${green(port)}`);
