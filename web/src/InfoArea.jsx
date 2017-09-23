const React = require('react');
const CSS = require('react-css-modules');
const styles = require('./InfoArea.pcss');
const classNames = require('classnames');

require('brace/mode/c_cpp');
require('brace/theme/monokai');
require('brace/keybinding/vim');

class InfoArea extends React.Component {
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
			<div styleName="info-area">
				<div styleName="logo-area">
					<img src="logo.svg" alt="DragonASIC"/>
				</div>
				<div styleName="info">
					<div styleName="head">Serial Output</div>
					<div>
						<div
							styleName={classNames('togglable-head', {active: this.state.isForwardingVisible})}
							onClick={this.handleClickTogglable}
							data-toggle="isForwardingVisible"
						>
							Forwarding Config
						</div>
						{this.state.isForwardingVisible && (
							<div>
								<div styleName="forwarding-config">
									<label htmlFor="protocol">Protocol</label>
									<input type="text" name="protocol" value="UDP"/>
								</div>
								<div styleName="forwarding-config">
									<label htmlFor="host">Host</label>
									<input type="text" name="host" value="172.217.25.206"/>
								</div>
								<div styleName="forwarding-config">
									<label htmlFor="port">Host</label>
									<input type="text" name="port" value="8080"/>
								</div>
							</div>
						)}
					</div>
					<div>
						<div
							styleName={classNames('togglable-head', {active: this.state.isPreviewVisible})}
							onClick={this.handleClickTogglable}
							data-toggle="isPreviewVisible"
						>
							Preview
						</div>
						{this.state.isPreviewVisible && (
							<div>
								<div styleName="preview">
								a31203720362e2d372e32313920383231312e363031202e32303120362030203020312e35393520322e31353320393831332e323831202e38383320322030203020312e34333820392e3334392d762e34313368332e37303476393531332e61323931312e333831202e39383120332030203020312e3237322d382e36303220353931372e20323931372e20322030203020312e3739352d372e37333332202e31323432202e31323430203020312031202e3034362d372e32373720313232352e393932202e32393520392030203020313731302e34383720382e36372d6c2e3532323420392e36372d712e3532332d352e353336312d2e3138392d322e35333631612e33333120313331312e3133302030203020312d2e33313320353331332e333131202e34303020323431302e32303020302030203120372e34303620392e3436227a3e2f0a0d2020202020202020703c746120683d644d2231322e37303920313534392e343531682e3038346c39352d322e3932312d2e3335342d392e35363231202e3335347a39314d3736302e343933202e38313461322e3739343720342e2039203020302d302e35343620372e32353320392e38373320372e3837332037203020302d302e32353220362e36333020362e3833353820352e20332030203020302e3233323620312e20332e3
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

module.exports = CSS(InfoArea, styles, {allowMultiple: true, handleNotFoundStyleName: 'log'});
