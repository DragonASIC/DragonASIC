const React = require('react');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './Sensor.pcss';

class Sensor extends React.Component {
	constructor(props, state) {
		super(props, state);

		this.state = {
		};
	}

	render() {
		return (
			<div styleName="sensor">
				<div styleName="sensor-head">{this.props.name} [{this.props.index}]</div>
			</div>
		);
	}
}

module.exports = Sensor;
