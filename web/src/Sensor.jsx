const React = require('react');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './Sensor.pcss';

class Sensor extends React.Component {
	constructor(props, state) {
		super(props, state);

		this.state = {
			isOpen: false,
			points: [
				[64, 128],
				[128, 128],
				[192, 128],
			],
		};
	}

	handleClickHead = () => {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	}

	render() {
		const polyline = [
			[0, this.state.points[0][1]],
			...this.state.points,
			[256, this.state.points[this.state.points.length - 1][1]],
		].map(([x, y]) => `${x},${y / 2}`).join(' ');

		const pointSize = 4;

		return (
			<div styleName="sensor">
				<div styleName="head" onClick={this.handleClickHead}>{this.props.name} [{this.props.index}]</div>
				{this.state.isOpen && (
					<div styleName="content">
						<svg viewBox="0 0 256 128">
							<polygon points={`${polyline} 256,128 0,128`} fill="rgba(255, 0, 0, 0.3)"/>
							<polyline points={polyline} fill="none" stroke="white" strokeWidth="2"/>
							{this.state.points.map(([x, y], index) => (
								<rect key={index} x={x - pointSize} y={y / 2 - pointSize} width={pointSize * 2} height={pointSize * 2} fill="white" style={{cursor: 'pointer'}}/>
							))}
							<line x1={this.props.clock} y1="0" x2={this.props.clock} y2="128" stroke="white" strokeWidth="2"/>
						</svg>
					</div>
				)}
			</div>
		);
	}
}

module.exports = Sensor;
