import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import css from './sidePanel.css';
import { closeSidePanel } from './store/sidePanel.action';
import { $injector } from '../../../injection';


/**
 *  
 * @class
 * @author aul
 */
export class SidePanel extends BaElement {

	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
		this._activeTabIndex = 0;
	}

	activateTab(index) {
		const tabcontents = [...this._root.querySelectorAll('.tabcontent')];
		tabcontents.forEach((tabcontent, i) => (i === index) ? tabcontent.style.display = 'block' : tabcontent.style.display = 'none');
		const tablinks = [...this._root.querySelectorAll('.tablink')];
		tablinks.forEach((tablink, i) => (i === index) ? tablink.classList.add('tablink-active') : tablink.classList.remove('tablink-active'));
	}

	/**
	* @override
	*/
	onAfterRender() {
		this.activateTab(this._activeTabIndex);
	}

	/**
	 * @override
	 */
	createView() {

		const { open } = this._state;
		const { portrait } = this._environmentService.getScreenOrientation();
		const getOverlayClass = () => {
			if (portrait) {
				return open ? 'overlay-mobile overlay-mobile-open' : 'overlay-mobile overlay-mobile-closed';
			}
			else {
				return open ? 'overlay-desktop overlay-desktop-open' : 'overlay-desktop overlay-desktop-closed';
			}
		};
		const getTabBarClass = () => portrait ? 'tab-bar-mobile' : 'tab-bar-desktop';
		const getHeaderClass = () => portrait ? 'header-mobile' : 'header-desktop';

		const items = [
			{ name: 'Data', description: 'Let\'s view geodata' },
			{ name: 'Share', description: '...share' },
			{ name: 'Draw', description: '...draw and measure on the map' },
			{ name: 'Routing', description: '...get a route' },
			{ name: 'Tools', description: '...and do other fancy stuff!' },
		];

		const onItemClicked = (index) => {
			this.activateTab(this._activeTabIndex = index);
		};


		return html`
			<style>${css}</style>
			<div class="sidePanel overlay ${getOverlayClass()}">
				<div class="${getHeaderClass()}">
					<div class="${getTabBarClass()}">
						${items.map((item, index) => html`<button class="tablink" @click=${() => onItemClicked(index)}>${item.name}</button>`)}
					</div>
					${portrait ? html`` : html`<a @click="${closeSidePanel}" title = "Close menue" > <span class="icon close"></a>`}
				</div>	
				<!-- Overlay content -->
				<div class="overlay-content">
					${items.map(item => html`
						<div class="tabcontent">
							<!-- <h1>${item.name}</h1>-->
							<p>${item.description}</p>
						</div>
					`)}
				</div>
			</div>
		`;
	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { sidePanel: { open } } = store;
		return { open };
	}

	static get tag() {
		return 'ba-side-panel';
	}
}
