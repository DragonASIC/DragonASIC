const React = require('react');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './IoArea.pcss';

class IoArea extends React.Component {
	constructor(props, state) {
		super(props, state);

		this.state = {
			modules: [],
			wires: [],
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

	render() {
		return (
			<div styleName="io-area">
				<div styleName="list">
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
