const React = require('react');
const classNames = require('classnames');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './InfoArea.pcss';

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
									{this.props.preview}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

module.exports = InfoArea;
