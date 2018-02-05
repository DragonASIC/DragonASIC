const Docker = require('dockerode');
const concatStream = require('concat-stream');
const path = require('path');
const tmp = require('tmp');
const noop = require('lodash/noop');
const {PassThrough} = require('stream');

const docker = new Docker();

class TimeoutError extends Error { }

module.exports = async ({image, command, before = noop, after = noop, onStdout = noop, onStderr = noop}) => {
	const {path: tmpPath, cleanup} = await new Promise((resolve, reject) => {
		tmp.dir({unsafeCleanup: true}, (error, dirPath, dirCleanup) => {
			if (error) {
				reject(error);
			} else {
				resolve({path: dirPath, cleanup: dirCleanup});
			}
		});
	});

	await before({tmpPath});

	let stdoutWriter = null;

	const stdoutPromise = new Promise((resolve) => {
		stdoutWriter = concatStream((stdout) => {
			resolve(stdout);
		});
	});

	let stderrWriter = null;

	const stderrPromise = new Promise((resolve) => {
		stderrWriter = concatStream((stderr) => {
			resolve(stderr);
		});
	});

	const dockerVolumePath = path.sep === '\\' ? tmpPath.replace('C:\\', '/c/').replace(/\\/g, '/') : tmpPath;
	const elvmPath = path.sep === '\\' ? path.resolve('compiler/elvm').replace('C:\\', '/c/').replace(/\\/g, '/') : path.resolve('compiler/elvm');

	const executeContainer = async () => {
		const container = await docker.createContainer({
			Hostname: '',
			User: '',
			AttachStdin: false,
			AttachStdout: true,
			AttachStderr: true,
			Tty: false,
			OpenStdin: false,
			StdinOnce: false,
			Env: null,
			Cmd: ['sh', '-c', command],
			Image: image,
			Volumes: {
				'/volume': {},
				'/elvm': {},
			},
			VolumesFrom: [],
			HostConfig: {
				Binds: [
					`${dockerVolumePath}:/volume`,
					`${elvmPath}:/elvm`,
				],
			},
		});

		const stream = await container.attach({
			stream: true,
			stdout: true,
			stderr: true,
		});

		const stdoutPass = new PassThrough();
		const stderrPass = new PassThrough();

		stdoutPass.pipe(stdoutWriter);
		stderrPass.pipe(stderrWriter);

		stdoutPass.on('data', onStdout);
		stderrPass.on('data', onStderr);

		stream.on('end', () => {
			stdoutPass.end();
			stderrPass.end();
		});

		container.modem.demuxStream(stream, stdoutPass, stderrPass);

		await container.start();
		await container.wait();
		await container.remove();
	};

	const runner = Promise.all([
		stdoutPromise,
		stderrPromise,
		executeContainer(),
	]);

	const [stdout, stderr] = await Promise.race([
		runner,
		new Promise((resolve, reject) => {
			setTimeout(() => {
				reject(new TimeoutError());
			}, 60000);
		}),
	]).catch((error) => {
		if (error instanceof TimeoutError) {
			// container.kill().then(() => container.remove()).then(() => Promise.reject(error));
		} else {
			throw error;
		}
	});

	const data = await after({tmpPath});

	cleanup();
	return {
		data: Buffer.isBuffer(data) ? data : Buffer.alloc(0),
		stdout: Buffer.isBuffer(stdout) ? stdout : Buffer.alloc(0),
		stderr: Buffer.isBuffer(stderr) ? stderr : Buffer.alloc(0),
	};
};
