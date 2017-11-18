const Docker = require('dockerode');
const concatStream = require('concat-stream');
const path = require('path');
const tmp = require('tmp');
const noop = require('lodash/noop');
const fs = require('fs');
const {promisify} = require('util');

const docker = new Docker();

class TimeoutError extends Error { }

module.exports = async ({image, command, before = noop, after = noop}) => {
	const {path: tmpPath, cleanup} = await new Promise((resolve, reject) => {
		tmp.dir({unsafeCleanup: true}, (error, path, cleanup) => {
			if (error) {
				reject(error);
			} else {
				resolve({path, cleanup});
			}
		});
	});
	console.log({tmpPath});

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
			Cmd: ['bash', '-c', command],
			Image: image,
			Volumes: {
				'/volume': {},
			},
			VolumesFrom: [],
			HostConfig: {
				Binds: [`${dockerVolumePath}:/volume`],
			},
		});

		const stream = await container.attach({
			stream: true,
			stdout: true,
			stderr: true,
		});

		container.modem.demuxStream(stream, stdoutWriter, stderrWriter);
		stream.on('end', () => {
			stdoutWriter.end();
			stderrWriter.end();
		});

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
