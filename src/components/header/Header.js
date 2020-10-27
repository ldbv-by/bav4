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

		const getH3Class = () => (mobile ? 'h3-mobile' : 'h3-desktop');
		const getIconClass = () => (mobile ? 'icon-mobile' : 'icon-desktop');

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
						<span class="icon ${getIconClass()} toggle-side-panel"></span>
					</a>
					<h3 class="${getH3Class()}">BAv4 (#nomigration)</h3>
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
