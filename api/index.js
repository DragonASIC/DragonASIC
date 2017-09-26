const Koa = require('koa');
const {get} = require('koa-route');
const Docker = require('dockerode');
const tmp = require('tmp');

const docker = new Docker();

const app = new Koa();

app.use(get('/', (context) => {
	context.body = 'Hello, World!';
}));

app.listen(3000);
