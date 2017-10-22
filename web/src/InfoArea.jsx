const React = require('react');
const classNames = require('classnames');

const Gear = require('react-icons/lib/io/gear-b');
const Forward = require('react-icons/lib/io/forward');
const GitHub = require('react-icons/lib/io/social-github');
const PersonStalker = require('react-icons/lib/io/person-stalker');
const Network = require('react-icons/lib/io/network');

// fmm...
// https://github.com/gajus/babel-plugin-react-css-modules/issues/38#issuecomment-310890776
import './InfoArea.pcss';

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
				<div styleName="button"><Gear/></div>
				<div styleName="button"><Forward/></div>
				<div styleName="button"><PersonStalker/></div>
				<div styleName="button"><Network/></div>
				<a href="https://github.com/DragonASIC/DragonASIC" target="_blank" rel="noopener noreferrer">
					<div styleName="button"><GitHub/></div>
				</a>
			</div>
		);
	}
}

module.exports = InfoArea;
