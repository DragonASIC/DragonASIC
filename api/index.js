const Koa = require('koa');
const {get, post} = require('koa-route');
const logger = require('koa-logger');
const cors = require('kcors');
const {blue, green} = require('colors/safe');
const fs = require('fs-extra');
const bodyParser = require('koa-bodyparser');
const {stripIndent} = require('common-tags');
const {promisify} = require('util');
const path = require('path');

const runner = require('./runner.js');

const app = new Koa();

app.use(logger());
app.use(bodyParser());
app.use(cors({
	origin: '*', // FIXME
	allowMethods: 'GET,POST',
	credentials: true,
}));

app.use(get('/', (context) => {
	context.body = 'Hello, World!';
}));

app.use(post('/generate', async (context) => {
	const {code} = context.request.body;

	const props = await runner({
		image: 'frolvlad/alpine-python3',
		before: async ({tmpPath}) => {
			await fs.writeFile(path.join(tmpPath, 'code.a'), code);
			await fs.copy(path.resolve(__dirname, '..', 'cpu', 'tools', 'Assembler', 'assembler.py'), path.join(tmpPath, 'assembler.py'));
		},
		command: 'cd /volume && python /volume/assembler.py /volume/code.a',
		after: ({tmpPath}) => fs.readFile(path.join(tmpPath, 'prom.bin')),
	});

	console.log(props.data.toString());

	const {data, stdout, stderr} = await runner({
		image: 'qflow',
		before: async ({tmpPath}) => {
			const verilog = `
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
			await promisify(fs.writeFile)(codePath, verilog);
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

app.use(post('/simulate', async (context) => {
	const {code, sensorData} = context.request.body;

	console.log(`${blue('LOG')} Compiling frontend...`);

	const frontendResult = await runner({
		image: 'compiler',
		before: async ({tmpPath}) => {
			await fs.writeFile(path.join(tmpPath, 'code.c'), stripIndent`
				#define OGPIO0 (*((unsigned char *)0x88))
				#define TRIS0 (*((unsigned char *)0x89))
				#define IGPIO0 (*((unsigned char *)0x8A))
				#define OGPIO1 (*((unsigned char *)0x8C))
				#define TRIS1 (*((unsigned char *)0x8D))
				#define OGPIO2 (*((unsigned char *)0x90))
				#define TRIS2 (*((unsigned char *)0x91))
				#define INPUT 0xFF
				#define OUTPUT 0x00
				
				${code}
			`);
		},
		command: './out/8cc -S -o /volume/code.c.eir /volume/code.c',
		after: ({tmpPath}) => fs.readFile(path.join(tmpPath, 'code.c.eir')),
	});

	console.log(`${blue('LOG')} Compiling backend...`);

	const backendResult = await runner({
		image: 'compiler',
		before: async ({tmpPath}) => {
			await fs.writeFile(path.join(tmpPath, 'code.c.eir'), frontendResult.data);
		},
		command: './out/elc -trsq /volume/code.c.eir',
	});

	console.log('=== Compile Result ===');
	console.log(backendResult.stdout.toString());

	console.log(`${blue('LOG')} Assembling...`);

	const assembleResult = await runner({
		image: 'python:3.6.4-alpine3.7',
		before: async ({tmpPath}) => {
			await fs.writeFile(path.join(tmpPath, 'code.a'), backendResult.stdout);
			await fs.copy(path.resolve(__dirname, '..', 'cpu', 'tools', 'Assembler', 'assembler.py'), path.join(tmpPath, 'assembler.py'));
		},
		command: 'cd /volume && python /volume/assembler.py /volume/code.a',
		after: ({tmpPath}) => fs.readFile(path.join(tmpPath, 'prom.bin')),
	});

	console.log(`${blue('LOG')} Simulating...`);

	const simulateResult = await runner({
		image: 'python:3.6.4-alpine3.7',
		before: async ({tmpPath}) => {
			await fs.ensureDir(path.join(tmpPath, 'settings'));
			await fs.ensureDir(path.join(tmpPath, 'Emulator'));

			await fs.writeFile(path.join(tmpPath, 'settings', 'prom.bin'), assembleResult.data);
			await fs.writeFile(path.join(tmpPath, 'settings', 'modules.json'), JSON.stringify({
				SPI0: {
					MODULE: 'SPI',
					BASEADDR: '80',
				},
				GPIO0: {
					MODULE: 'GPIO',
					BASEADDR: '88',
				},
				GPIO1: {
					MODULE: 'GPIO',
					BASEADDR: '8C',
				},
				GPIO2: {
					MODULE: 'GPIO',
					BASEADDR: '90',
				},
			}));
			await fs.writeFile(path.join(tmpPath, 'settings', 'portinfo.json'), JSON.stringify({
				GPIO0: {
					IGPIO: sensorData[0],
				},
				GPIO1: {
					IGPIO: sensorData[1],
				},
				GPIO2: {
					IGPIO: sensorData[2],
				},
				SPI0: {
					SPIRX: [0, 0, 0, 80, 70, 60, 50, 40, 30],
				},
				SPI1: {
					SPIRX: [0, 0, 0, 80, 70, 60, 50, 40, 30],
				},
			}));
			await fs.copy(path.resolve(__dirname, '..', 'cpu', 'tools', 'Emulator', 'TRSQ_emu.py'), path.join(tmpPath, 'Emulator', 'TRSQ_emu.py'));
		},
		command: 'cd /volume/Emulator && python TRSQ_emu.py -c 1024',
		after: ({tmpPath}) => fs.readFile(path.join(tmpPath, 'Emulator', 'port_dump.json')),
	});

	const data = JSON.parse(simulateResult.data);
	console.log(data);

	for (const [key, value] of Object.entries(data)) {
		if (key.startsWith('GPIO')) {
			data[key] = value.map((pins) => (
				pins.every((pin) => pin.startsWith('O'))
					? parseInt(pins.reverse().map(([, pin]) => pin).join(''), 2)
					: 0
			));
		}
	}

	context.body = data;
}));

const port = parseInt(process.env.PORT) || 3000;
app.listen(port);

console.log(`${blue('LOG')} DragonASIC API server listening port ${green(port)}`);
