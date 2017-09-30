const React = require('react');
const {default: AceEditor} = require('react-ace');
const {stripIndent} = require('common-tags');
const InfoArea = require('./InfoArea.jsx');
const api = require('./api.js');
const simulator = require('../lib/simulator.ts');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './App.pcss';

require('brace/mode/c_cpp');
require('brace/theme/monokai');

class App extends React.Component {
	constructor() {
		super();

		this.state = {
			code: stripIndent`
				#include <stdio.h>

				int main(int argc, char *argv[]) {
					printf("Hello, World!\\n");
					return 0;
				}
			`,
			stdout: '',
			isRunning: false,
		};

		this.code = '';
	}

	handleClickRun = async () => {
		this.setState({isRunning: true});
		try {
			const data = await api.post('/generate', {code: this.code});
			this.setState({stdout: data.stdout});

			const element = document.createElement('a');
			element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(data.data)}`);
			element.setAttribute('download', 'layout.def');

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({isRunning: false});
		}
	}

	handleChangeAceEditor = (code) => {
		this.code = code;
	}

	render() {
		return (
			<div styleName="app">
				<InfoArea preview={this.state.stdout}/>
				<div styleName="editor-area">
					<div styleName="editor-head">
						{this.state.isRunning ? (
							<div styleName="spinner">
								<div styleName="sk-wave" className="sk-wave">
									<div styleName="sk-rect" className="sk-rect sk-rect1"/>
									<div styleName="sk-rect" className="sk-rect sk-rect2"/>
									<div styleName="sk-rect" className="sk-rect sk-rect3"/>
									<div styleName="sk-rect" className="sk-rect sk-rect4"/>
									<div styleName="sk-rect" className="sk-rect sk-rect5"/>
								</div>
							</div>
						) : (
							<button styleName="run" onClick={this.handleClickRun}/>
						)}
					</div>
					<AceEditor
						mode="c_cpp"
						theme="monokai"
						keyboardHandler="vim"
						name="editor"
						width="100%"
						height="100%"
						value={this.state.code}
						onChange={this.handleChangeAceEditor}
					/>
				</div>
				<div styleName="sensor-area">
					<div styleName="head">Sensors</div>
					<div styleName="sensor">
						<div styleName="sensor-head">DCP0192 [0]</div>
						<svg styleName="sensor-data" viewBox="0 0 200 100">
							<path d="M -10 20 L 50 0 L 80 10 L 100 30 L 150 30 L 210 0 L 210 110 L -10 110 Z" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2px" fill="rgba(222, 28, 86, 0.76)"/>
						</svg>
					</div>
					<div styleName="sensor">
						<div styleName="sensor-head">DCP0192 [1]</div>
						<svg styleName="sensor-data" viewBox="0 0 200 100">
							<path d="M -10 20 L 50 0 L 80 10 L 100 30 L 150 30 L 210 0 L 210 110 L -10 110 Z" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2px" fill="rgba(28, 109, 222, 0.76)"/>
						</svg>
					</div>
				</div>
			</div>
		);
	}
}

module.exports = App;
