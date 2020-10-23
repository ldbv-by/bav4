import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import BaElement from '../../BaElement';
import './sidePanel.css';
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
	}

	/**
	 * @override
	 */
	onAfterRender() {
		this.getElementsByClassName('tabcontent')[0].style.display = 'block';
		this.getElementsByClassName('tablink')[0].classList.add('tablink-active');
	}


	/**
	 * @override
	 */
	createView() {

		const { open } = this.state;
		const { mobile } = this.environmentService;
		const getOverlayClass = () => mobile ? 'overlay-mobile' : 'overlay-desktop';
		const getTabBarClass = () => mobile ? 'tab-bar-mobile' : 'tab-bar-desktop';
		const getHeaderClass = () => mobile ? 'header-mobile' : 'header-desktop';
		const styles = {};
		if (mobile) {
			Object.assign(styles, {
				height: open ? '410px' : '0px',
				width: '100%'
			});
		}
		else {
			Object.assign(styles, {
				width: open ? '410px' : '0px',
				height: '100%'
			});
		}

		const items = [
			{ name: 'Share', description: 'Let\'s share' },
			{ name: 'Print', description: '...print' },
			{ name: 'Draw', description: '...draw and measure on the map' },
			{ name: 'Routing', description: '...get a route' },
			{ name: 'Tools', description: '...and do other fancy stuff!' },
		];

		const onItemClicked = (index) => {
			const tabcontents = [...this.getElementsByClassName('tabcontent')];
			tabcontents.forEach((tabcontent, i) => (i === index) ? tabcontent.style.display = 'block' : tabcontent.style.display = 'none');
			const tablinks = [...this.getElementsByClassName('tablink')];
			tablinks.forEach((tablink, i) => (i === index) ? tablink.classList.add('tablink-active') : tablink.classList.remove('tablink-active'));
		};


		return html`
			<div class="sidePanel overlay ${getOverlayClass()}" style=${styleMap(styles)} >
				<div class="${getHeaderClass()}">
					<div class="${getTabBarClass()}">
						${items.map((item, index) => html`<button class="tablink" @click=${() => onItemClicked(index)}>${item.name}</button>`)}
					</div>	
					<a @click="${closeSidePanel}" title="Close menue"><span class="icon close"></a>
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
