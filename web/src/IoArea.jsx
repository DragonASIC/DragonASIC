const React = require('react');
const Backward = require('react-icons/lib/fa/backward');
const StepBackward = require('react-icons/lib/fa/step-backward');
const Forward = require('react-icons/lib/fa/forward');
const StepForward = require('react-icons/lib/fa/step-forward');
const PlusCircle = require('react-icons/lib/fa/plus-circle');

const Sensor = require('./Sensor.jsx');

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
			shownModalHead: null,
			isForwardingVisible: true,
			isPreviewVisible: true,
			isSensorModalVisible: false,
		};

		this.sensorData = [];
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

	handleClickAddSensor = () => {
		this.setState({
			isSensorModalVisible: !this.state.isSensorModalVisible,
		});
	}

	handleClickModalHead = (event) => {
		if (event.target.textContent === this.state.shownModalHead) {
			this.setState({
				shownModalHead: null,
			});
		} else {
			this.setState({
				shownModalHead: event.target.textContent,
			});
		}
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

	render() {
		return (
			<div styleName="io-area">
				<div styleName="list">
					<div styleName="head">
						Input/Output
						<div styleName="add-sensor">
							<div onClick={this.handleClickAddSensor}>
								<PlusCircle/>
							</div>
							{this.state.isSensorModalVisible && (
								<div styleName="sensor-modal">
									<div styleName="modal-item">
										<div styleName="modal-head" onClick={this.handleClickModalHead}>
											Examples
										</div>
										{this.state.shownModalHead === 'Examples' && (
											<div styleName="modal-list">
												<div styleName="modal-list-item">TSL2561</div>
												<div styleName="modal-list-item">DCP0192</div>
												<div styleName="modal-list-item">I<sup>2</sup>C Serial Output</div>
											</div>
										)}
									</div>
									{['Automotive', 'Electric', 'Optical', 'Pressure', 'Serial'].map((item) => (
										<div key={item} styleName="modal-item">
											<div styleName="modal-head" onClick={this.handleClickModalHead}>
												{item}
											</div>
											{this.state.shownModalHead === item && (
												<div styleName="modal-list">
													{Array(5).fill().map((_, index) => (
														<div key={index} styleName="modal-list-item">xxxxx</div>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
					<div styleName="control-area">
						<div styleName="control backward" onClick={this.handleChangeClock.bind(null, -10)}><Backward/></div>
						<div styleName="control step-backward" onClick={this.handleChangeClock.bind(null, -1)}><StepBackward/></div>
						<input styleName="clock" value={this.state.clock} onChange={this.handleClockChange}/>
						<div styleName="control step-forward" onClick={this.handleChangeClock.bind(null, 1)}><StepForward/></div>
						<div styleName="control forward" onClick={this.handleChangeClock.bind(null, 10)}><Forward/></div>
					</div>
					<div styleName="sensor-area">
						<Sensor name="GPIO1" index={1} clock={this.state.clock} onUpdateData={this.handleUpdateSensorData} direction="in"/>
						<Sensor name="GPIO2" index={2} clock={this.state.clock} onUpdateData={this.handleUpdateSensorData} direction="in"/>
						<Sensor name="GPIO0" index={0} clock={this.state.clock} onUpdateData={this.handleUpdateSensorData} direction="out" data={this.props.simulationData && this.props.simulationData.GPIO0}/>
					</div>
					<div styleName="simulation-button" onClick={this.handleStartSimulation}>
						Start Simulation
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
					<div styleName="button">
						Connect via WebUSB
					</div>
				</div>
			</div>
		);
	}
}

module.exports = IoArea;
