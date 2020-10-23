import { html } from 'lit-html';
import BaElement from '../BaElement';
import { toggleSidePanel } from '../menue/sidePanel/store/sidePanel.action';
import { $injector } from '../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
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
	}

	createView() {

		const { mobile } = this.environmentService;

		const getH3Class = () => (mobile ? 'h3-mobile' : 'h3-desktop');
		const getIconClass = () => (mobile ? 'icon-mobile' : 'icon-desktop');
	

		const getTitle = () => {
			const { sidePanelIsOpen } = this.state;
			return sidePanelIsOpen ? 'Close menue' : 'Open menue';
		};

		return html`
			<div class="header header-desktop">
				<div class="content">
					<a title="${getTitle()}" @click="${toggleSidePanel}">
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
}
