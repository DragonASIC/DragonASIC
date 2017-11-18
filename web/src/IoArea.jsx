const React = require('react');
const Backward = require('react-icons/lib/fa/backward');
const StepBackward = require('react-icons/lib/fa/step-backward');
const Forward = require('react-icons/lib/fa/forward');
const StepForward = require('react-icons/lib/fa/step-forward');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './IoArea.pcss';

class IoArea extends React.Component {
	constructor(props, state) {
		super(props, state);

		this.state = {
			modules: [],
			wires: [],
			clock: 0,
			isForwardingVisible: true,
			isPreviewVisible: true,
		};
	}

	handleClickTogglable = (event) => {
		if (event.target.dataset.toggle) {
			this.setState({
				[event.target.dataset.toggle]: !this.state[event.target.dataset.toggle],
			});
		}
	}

	handleClockChange = (event) => {
		const newClock = parseInt(event.target.value);
		if (!Number.isNaN(newClock)) {
			this.setState({
				clock: newClock,
			});
		}
	}

	render() {
		return (
			<div styleName="io-area">
				<div styleName="list">
					<div styleName="head">
						I/O List
					</div>
					<div styleName="control-area">
						<div styleName="control backward"><Backward/></div>
						<div styleName="control step-backward"><StepBackward/></div>
						<input styleName="clock" value={this.state.clock} onChange={this.handleClockChange}/>
						<div styleName="control step-forward"><StepForward/></div>
						<div styleName="control forward"><Forward/></div>
					</div>
					<div styleName="sensor">
						<div styleName="sensor-head">TSL2561 [0]</div>
					</div>
					<div styleName="sensor">
						<div styleName="sensor-head">DCP0192 [1]</div>
					</div>
					<div styleName="sensor">
						<div styleName="sensor-head">I<sup>2</sup>C Serial Output [2]</div>
					</div>
				</div>
				<div styleName="detail">
					<div styleName="head">TSL2561</div>
					<ul>
						<li>
							<div styleName="item">Interface</div>
							<div styleName="value">I<sup>2</sup>C</div>
						</li>
						<li>
							<div styleName="item">Range</div>
							<div styleName="value">0.1～40000</div>
						</li>
						<li>
							<div styleName="item">Unit</div>
							<div styleName="value">Lux</div>
						</li>
					</ul>
					<div styleName="button">
						Connect via WebUSB
					</div>
				</div>
			</div>
		);
	}
}

module.exports = IoArea;
