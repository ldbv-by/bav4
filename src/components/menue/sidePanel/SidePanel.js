import { html } from 'lit-html';
import BaElement from '../../BaElement';
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
		this.environmentService = EnvironmentService;
		this.activeTabIndex = 0;
	}

	activateTab(index) {
		const tabcontents = [...this.root.querySelectorAll('.tabcontent')];
		tabcontents.forEach((tabcontent, i) => (i === index) ? tabcontent.style.display = 'block' : tabcontent.style.display = 'none');
		const tablinks = [...this.root.querySelectorAll('.tablink')];
		tablinks.forEach((tablink, i) => (i === index) ? tablink.classList.add('tablink-active') : tablink.classList.remove('tablink-active'));
	}

	/**
	* @override
	*/
	onAfterRender() {
		this.activateTab(this.activeTabIndex);
	}

	/**
	 * @override
	 */
	createView() {

		const { open } = this.state;
		const { mobile } = this.environmentService;
		const getOverlayClass = () => {
			if (mobile) {
				return open ? 'overlay-mobile overlay-mobile-open' : 'overlay-mobile overlay-mobile-closed';
			}
			else {
				return open ? 'overlay-desktop overlay-desktop-open' : 'overlay-desktop overlay-desktop-closed';
			}
		};
		const getTabBarClass = () => mobile ? 'tab-bar-mobile' : 'tab-bar-desktop';
		const getHeaderClass = () => mobile ? 'header-mobile' : 'header-desktop';

		const items = [
			{ name: 'Share', description: 'Let\'s share' },
			{ name: 'Print', description: '...print' },
			{ name: 'Draw', description: '...draw and measure on the map' },
			{ name: 'Routing', description: '...get a route' },
			{ name: 'Tools', description: '...and do other fancy stuff!' },
		];

		const onItemClicked = (index) => {
			this.activateTab(this.activeTabIndex = index);
		};


		return html`
			<style>${css.toString()}</style>
			<div class="sidePanel overlay ${getOverlayClass()}">
				<div class="${getHeaderClass()}">
					<div class="${getTabBarClass()}">
						${items.map((item, index) => html`<button class="tablink" @click=${() => onItemClicked(index)}>${item.name}</button>`)}
					</div>
					${mobile ? html`` : html`<a @click="${closeSidePanel}" title = "Close menue" > <span class="icon close"></a>`}
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
