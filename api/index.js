const Koa = require('koa');
const {get} = require('koa-route');
const Docker = require('dockerode');
const tmp = require('tmp');
const {blue, green} = require('colors/safe');

const docker = new Docker();

const app = new Koa();

app.use(get('/', (context) => {
	context.body = 'Hello, World!';
}));

const port = parseInt(process.env.PORT) || 3000;
app.listen(port);

console.log(`${blue('LOG')} DragonASIC API server listening port ${green(port)}`);
