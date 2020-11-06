import { html } from 'lit-html';
import BaElement from '../BaElement';
import { toggleSidePanel } from '../menue/sidePanel/store/sidePanel.action';
import { $injector } from '../../injection';
import './header.css';


/**
 * Container element for header stuff. 
 * @class
 * @author aul
 */
export class Header extends BaElement {

	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this.environmentService = EnvironmentService;
		this.menueButtonLocked = false;
	}

	createView() {

		const { mobile } = this.environmentService;

		const getDeviceClass = (prefix) => (mobile ? prefix + '-mobile' : prefix + '-desktop');

		const getTitle = () => {
			const { sidePanelIsOpen } = this.state;
			return sidePanelIsOpen ? 'Close menue' : 'Open menue';
		};

		const toggleSidePanelGuarded = () => {

			if (!this.menueButtonLocked) {
				this.menueButtonLocked = true;
				toggleSidePanel();
				window.setTimeout(() => this.menueButtonLocked = false, Header.menueButtonLockDuration);
			}
		};

		return html`
			<div class="header header-desktop">
				<div class="content">
					<a title="${getTitle()}" @click="${toggleSidePanelGuarded}">
						<span class="icon ${getDeviceClass('icon')} toggle-side-panel"></span>
					</a>
					<div class="logo ${getDeviceClass('logo')}"></div>
					<h3 class="${getDeviceClass('h3')}">BAv4 (#nomigration)</h3>
				</div>
			</div>
		`;
	}

	/**
	 * 
	 * @param {@override} store 
	 */
	extractState(store) {
		const { sidePanel: { open } } = store;
		return { sidePanelIsOpen: open };
	}

	static get tag() {
		return 'ba-header';
	}

	static get menueButtonLockDuration() {
		return 500;
	}
}
