const Koa = require('koa');
const {get, post} = require('koa-route');
const logger = require('koa-logger');
const cors = require('kcors');
const {blue, green} = require('colors/safe');
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');

const runner = require('./runner.js');

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

app.use(post('/generate', async (context) => {
	const {data, stdout, stderr} = await runner({
		image: 'qflow',
		before: async ({tmpPath}) => {
			const code = `
				/*
				 *--------------------------------------------------------------
				 * This module converts a counter value N into a reset value
				 * for an 8-bit LFSR.  The count is initialized by "reset" high
				 * or "start" transition high.  When the count is valid, it is
				 * latched into "dp" and the signal "done" is raised to indicate
				 * a valid new value of "dp".
				 *--------------------------------------------------------------
				 */

				module map9v3(clock, reset, start, N, dp, done, counter, sr);

				input         clock;
				input	      start;         // run at rising edge of start
				input	      reset;         // high is reset case ( run after reset)
				input   [8:0] N;             // the number to divide by

				output  [8:0] dp;	     // these outputs drive an LFSR counter
				output	      done;
				output	[7:0] counter;
				output  [7:0] sr;

				reg     [8:0] dp;
				reg	[7:0] sr;
				reg	[7:0] counter;
				reg	[1:0] startbuf;
				reg	      done;
				reg	[2:0] state;

				parameter INIT 		= 3'b000;
				parameter RUN 		= 3'b001;
				parameter ALMOSTDONE 	= 3'b010;
				parameter DONE 		= 3'b011;
				parameter WAIT 		= 3'b100;


				always @(posedge clock or posedge reset) begin

				    if (reset == 1) begin

					dp <= 9'b0;
					sr <= 8'b0;
					counter <= 8'b0;
					startbuf <= 2'b00;
					done <= 0;
					state <= INIT;

				    end else begin

					if (state == INIT) begin
					    counter <= 255 - N[8:1] + 3;
					    sr <= 8'b0;
					    done <= 0;
					    state <= RUN;

					end else if (state == RUN) begin
					    sr[7] <= sr[6];
					    sr[6] <= sr[5];
					    sr[5] <= sr[4];
					    sr[4] <= sr[3];
					    sr[3] <= sr[2];
					    sr[2] <= sr[1];
					    sr[1] <= sr[0];
					    sr[0] <= ~(sr[7] ^ sr[5] ^ sr[4] ^ sr[3]);
					    counter <= counter - 1;
					    if (counter == 0) begin
					       state <= ALMOSTDONE;
					    end

					end else if (state == ALMOSTDONE) begin
					    dp[0] <= N[0];
					    dp[8:1] <= sr[7:0];
					    state <= DONE;

					end else if (state == DONE) begin
					    done <= 1;
					    state <= WAIT;

					end else if (state == WAIT) begin
					    if (startbuf == 2'b01) begin
						state <= INIT;
					    end
					end

					startbuf <= {startbuf[0], start};
				    end
				end

				endmodule
			`;

			await promisify(fs.mkdir)(path.join(tmpPath, 'layout'));
			await promisify(fs.mkdir)(path.join(tmpPath, 'source'));
			await promisify(fs.mkdir)(path.join(tmpPath, 'synthesis'));

			const codePath = path.join(tmpPath, 'source', 'map9v3.v');
			await promisify(fs.writeFile)(codePath, code);
		},
		command: 'cd /volume && qflow synthesize place route map9v3',
		after: ({tmpPath}) => promisify(fs.readFile)(path.join(tmpPath, 'layout', 'map9v3.def')),
	});

	context.body = {
		data: data.toString(),
		stdout: stdout.toString(),
		stderr: stderr.toString(),
	};
}));

const port = parseInt(process.env.PORT) || 3000;
app.listen(port);

console.log(`${blue('LOG')} DragonASIC API server listening port ${green(port)}`);
