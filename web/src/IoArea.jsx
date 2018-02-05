const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const Spinner = require('react-spinner');
const Backward = require('react-icons/lib/fa/backward');
const StepBackward = require('react-icons/lib/fa/step-backward');
const Forward = require('react-icons/lib/fa/forward');
const StepForward = require('react-icons/lib/fa/step-forward');
const PlusCircle = require('react-icons/lib/fa/plus-circle');
const Gear = require('react-icons/lib/go/gear');
const {Tooltip} = require('react-tippy');

const Sensor = require('./Sensor.jsx');

import './IoArea.pcss';

class ModalListItem extends React.Component {
	static propTypes = {
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node,
		]).isRequired,
		onClick: PropTypes.func.isRequired,
		direction: PropTypes.oneOf(['in', 'out']).isRequired,
	}

	handleClick = (event) => {
		this.props.onClick(this.props.children, this.props.direction, event);
	}

	render() {
		return (
			<div styleName="modal-list-item" onClick={this.handleClick}>
				{this.props.children}
			</div>
		);
	}
}

class IoArea extends React.Component {
	static propTypes = {
		isSimulating: PropTypes.bool.isRequired,
		onStartSimulation: PropTypes.func.isRequired,
		simulationStatus: PropTypes.string.isRequired,
		simulationData: PropTypes.shape({
			GPIO0: PropTypes.arrayOf(PropTypes.number).isRequired,
		}),
	}

	static defaultProps = {
		simulationData: null,
	}

	constructor(props, state) {
		super(props, state);

		this.state = {
			clock: 0,
			sensors: [],
			isSensorModalVisible: false,
		};

		this.sensorData = [
			Array(256).fill(0),
			Array(256).fill(0),
			Array(256).fill(0),
		];
	}

	handleClockChange = (event) => {
		const newClock = parseInt(event.target.value);
		if (!Number.isNaN(newClock)) {
			this.setState({
				clock: newClock,
			});
		}
	}

	handleClickAddSensor = () => {
		this.setState((prevState) => ({
			isSensorModalVisible: !prevState.isSensorModalVisible,
		}));
	}

	handleStartSimulation = () => {
		this.props.onStartSimulation(this.sensorData);
	}

	handleChangeClock = (delta) => {
		const newClock = Math.max(0, Math.min(this.state.clock + delta, 255));
		if (this.state.clock !== newClock) {
			this.setState({clock: newClock});
		}
	}

	handleUpdateSensorData = (index, data) => {
		this.sensorData[index] = data;
	}

	handleRequestCloseTooltip = () => {
		this.setState({isSensorModalVisible: false});
	}

	handleClickModalListItem = (node, direction) => {
		this.setState(({sensors}) => ({
			isSensorModalVisible: false,
			sensors: sensors.concat([{
				node,
				index: Math.max(-1, ...sensors.map(({index}) => index)) + 1,
				direction,
			}]),
		}));
	}

	handleRequestCloseSensor = (index) => {
		this.setState(({sensors}) => ({
			sensors: sensors.filter((sensor) => sensor.index !== index),
		}));
	}

	render() {
		return (
			<div styleName="io-area">
				<div styleName="list">
					<div styleName="head">
						Input/Output
						<div styleName="add-sensor">
							<Tooltip
								duration={100}
								position="bottom-end"
								open={this.state.isSensorModalVisible}
								interactive
								arrow
								animateFill={false}
								onRequestClose={this.handleRequestCloseTooltip}
								html={
									<div styleName="sensor-modal">
										<div styleName="modal-item">
											<div styleName="modal-head-area">
												<div styleName="modal-head">Examples</div>
											</div>
											<div styleName="modal-list">
												<ModalListItem
													onClick={this.handleClickModalListItem}
													direction="in"
												>
													GPIO in
												</ModalListItem>
												<ModalListItem
													onClick={this.handleClickModalListItem}
													direction="out"
												>
													GPIO out
												</ModalListItem>
												<ModalListItem
													onClick={this.handleClickModalListItem}
													directian="out"
												>
													I<sup>2</sup>C Serial Output
												</ModalListItem>
											</div>
										</div>
										{['Automotive', 'Electric', 'Optical', 'Pressure', 'Serial'].map((item) => (
											<div key={item} styleName="modal-item">
												<div styleName="modal-head-area">
													<div styleName="modal-head">{item}</div>
												</div>
												<div styleName="modal-list">
													{Array(5).fill().map((_, index) => (
														<ModalListItem
															key={index}
															onClick={this.handleClickModalListItem}
														>
															xxxxx
														</ModalListItem>
													))}
												</div>
											</div>
										))}
									</div>
								}
							>
								<div onClick={this.handleClickAddSensor}>
									<PlusCircle/>
								</div>
							</Tooltip>
						</div>
					</div>
					<div styleName="control-area">
						<div styleName="control" onClick={this.handleChangeClock.bind(null, -10)}><Backward/></div>
						<div styleName="control" onClick={this.handleChangeClock.bind(null, -1)}><StepBackward/></div>
						<input value={this.state.clock} onChange={this.handleClockChange}/>
						<div styleName="control" onClick={this.handleChangeClock.bind(null, 1)}><StepForward/></div>
						<div styleName="control" onClick={this.handleChangeClock.bind(null, 10)}><Forward/></div>
					</div>
					<div styleName="sensor-area">
						{this.state.sensors.map(({index, node, direction}) => (
							<Sensor
								key={index}
								name={node}
								index={index}
								clock={this.state.clock}
								onUpdateData={this.handleUpdateSensorData}
								onRequestClose={this.handleRequestCloseSensor}
								direction={direction}
								data={this.props.simulationData && this.props.simulationData.GPIO0}
							/>
						))}
					</div>
					<div styleName="simulation-button-area">
						{this.props.isSimulating && this.props.simulationStatus && (
							<div styleName="simulation-status">
								{this.props.simulationStatus}
							</div>
						)}
						<div
							styleName={classNames('simulation-button', {simulating: this.props.isSimulating})}
							onClick={this.handleStartSimulation}
						>
							{this.props.isSimulating ? (
								<Spinner/>
							) : (
								<React.Fragment>
									<Gear/> Start Simulation
								</React.Fragment>
							)}
						</div>
					</div>
				</div>
				<div styleName="detail">
					<div styleName="head">GPIO0</div>
					<ul>
						<li>
							<div styleName="item">Interface</div>
							<div styleName="value">GPIO</div>
						</li>
						<li>
							<div styleName="item">Range</div>
							<div styleName="value">0～255</div>
						</li>
						<li>
							<div styleName="item">Unit</div>
							<div styleName="value">Lux</div>
						</li>
					</ul>
					<Tooltip
						styleName="button"
						style={{display: 'block'}}
						duration={100}
						title="Unimplemented"
					>
						Connect via WebUSB
					</Tooltip>
				</div>
			</div>
		);
	}
}

module.exports = IoArea;
