const Koa = require('koa');
const {get} = require('koa-route');

const app = new Koa();

app.use(get('/', (context) => {
	context.body = 'Hello, World!';
}));

app.listen(3000);
