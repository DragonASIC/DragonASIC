const React = require('react');
const {default: AceEditor} = require('react-ace');
const {stripIndent} = require('common-tags');
const classNames = require('classnames');
const ArrowDown = require('react-icons/lib/io/arrow-down-c');
const InfoArea = require('./InfoArea.jsx');
const IoArea = require('./IoArea.jsx');
const api = require('./api.js');
const simulator = require('../lib/simulator.ts');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './App.pcss';

require('brace/mode/c_cpp');
require('brace/theme/eclipse');
require('brace/keybinding/vim');

class App extends React.Component {
	constructor() {
		super();

		this.state = {
			code: stripIndent`
				LDL 1
				ST 10
				LDL 1
				HOGE 1
				ADD 10
				ST 10
				LD 10
				ST 11
				GOTO 2
				HALT
			`,
			stdout: '',
			isRunning: false,
			activeTab: 'editor',
			downloadLink: '',
		};

		this.code = this.state.code;
	}

	handleClickTab = (event) => {
		const {tab} = event.target.dataset;
		if (this.state.activeTab !== tab) {
			this.setState({activeTab: tab});
		}
	}

	handleClickRun = async () => {
		this.setState({
			isRunning: true,
			activeTab: 'build',
		});
		try {
			const data = await api.post('/generate', {code: this.code});
			const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(data.data)}`;

			this.setState({
				stdout: data.stdout,
				downloadLink: dataUri,
			});
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
						<div styleName="tabs">
							<div
								styleName={classNames('tab', {active: this.state.activeTab === 'editor'})}
								onClick={this.handleClickTab}
								data-tab="editor"
							>
								Editor
							</div>
							<div
								styleName={classNames('tab', {active: this.state.activeTab === 'build'})}
								onClick={this.handleClickTab}
								data-tab="build"
							>
								Build Result
							</div>
						</div>
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
					{this.state.activeTab === 'editor' && (
						<AceEditor
							mode="c_cpp"
							theme="eclipse"
							keyboardHandler="vim"
							name="editor"
							width="100%"
							height="100%"
							value={this.state.code}
							onChange={this.handleChangeAceEditor}
						/>
					)}
					{this.state.activeTab === 'build' && (
						<div styleName="build">
							<div styleName="column">
								<div styleName="head">Build Log</div>
								<div styleName="stdout">{this.state.stdout}</div>
							</div>
							<div styleName="column">
								<div styleName="head">Pin Layout</div>
								<div styleName="pin">
									Preview Disabled
								</div>
								<a styleName={classNames('download', {active: !this.state.isRunning})} download="layout.def" href={this.state.downloadLink}>
									<ArrowDown/>Download Layout File
								</a>
							</div>
						</div>
					)}
				</div>
				<IoArea/>
			</div>
		);
	}
}

module.exports = App;
