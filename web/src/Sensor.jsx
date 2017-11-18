/* eslint react/no-multi-comp: "off" */

const React = require('react');
const Hammer = require('react-hammerjs');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './Sensor.pcss';

const Point = (props) => {
	const onPan = (event) => {
		props.onPan(props.index, event);
	};

	const pointSize = 4;

	return (
		<Hammer onPan={onPan}>
			<rect x={props.x - pointSize} y={(256 - props.y) / 2 - pointSize} width={pointSize * 2} height={pointSize * 2} fill="white" style={{cursor: 'pointer'}}/>
		</Hammer>
	);
};

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
			tempPointIndex: null,
			tempPointDelta: null,
		};
	}

	handleClickHead = () => {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	}

	handlePanPoint = (index, event) => {
		if (event.eventType === 4 /* INPUT_END */) {
			this.state.points[index][0] += (event.deltaX * 128 / 152);
			this.state.points[index][1] -= (event.deltaY * 128 / 152);

			this.setState({
				tempPointIndex: null,
				tempPointDelta: null,
				points: this.state.points,
			});
		} else {
			this.setState({
				tempPointIndex: index,
				tempPointDelta: [
					event.deltaX * 128 / 152,
					event.deltaY * 128 / 152,
				],
			});
		}
	}

	getInterpolatedValue = (clock) => {
		if (clock <= this.state.points[0][0]) {
			return Math.floor(this.state.points[0][1]);
		}

		if (this.state.points[this.state.points.length - 1][0] <= clock) {
			return Math.floor(this.state.points[this.state.points.length - 1][1]);
		}

		const nearestIndex = this.state.points.findIndex(([x]) => clock <= x);
		const nearestPoints = [
			this.state.points[nearestIndex - 1],
			this.state.points[nearestIndex],
		];

		return Math.floor((nearestPoints[1][1] * (clock - nearestPoints[0][0]) + nearestPoints[0][1] * (nearestPoints[1][0] - clock)) / (nearestPoints[1][0] - nearestPoints[0][0]));
	}

	render() {
		const points = this.state.points.slice();
		if (this.state.tempPointIndex !== null) {
			points[this.state.tempPointIndex] = points[this.state.tempPointIndex].slice();
			points[this.state.tempPointIndex][0] += this.state.tempPointDelta[0];
			points[this.state.tempPointIndex][1] -= this.state.tempPointDelta[1];
		}

		const polyline = [
			[0, points[0][1]],
			...points,
			[256, points[points.length - 1][1]],
		].map(([x, y]) => `${x},${(256 - y) / 2}`).join(' ');

		return (
			<div styleName="sensor">
				<div styleName="head" onClick={this.handleClickHead}>{this.props.name} [{this.props.index}] ({this.getInterpolatedValue(this.props.clock)})</div>
				{this.state.isOpen && (
					<div styleName="content">
						<svg viewBox="0 0 256 128">
							<polygon points={`${polyline} 256,128 0,128`} fill="rgba(255, 0, 0, 0.3)"/>
							<polyline points={polyline} fill="none" stroke="white" strokeWidth="2"/>
							{points.map(([x, y], index) => (
								<Point key={index} index={index} x={x} y={y} onPan={this.handlePanPoint}/>
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
