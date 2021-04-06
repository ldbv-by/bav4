import { html, nothing } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './sidePanel.css';
import { closeSidePanel } from '../../store/sidePanel.action';
import { $injector } from '../../../../injection';
import { addLayer } from '../../../map/store/layers.action';


/**
 *  
 * @class
 * @author aul
 */
export class SidePanel extends BaElement {

	constructor() {
		super();

		const { EnvironmentService, SearchResultProviderService: providerService } = $injector.inject('EnvironmentService', 'SearchResultProviderService');
		this._environmentService = EnvironmentService;
		this._georesourceSearchResultProvider = providerService.getGeoresourceSearchResultProvider();
		this._activeTabIndex = 0;
	}

	activateTab(index) {
		const tabcontents = [...this._root.querySelectorAll('.tabcontent')];
		tabcontents.forEach((tabcontent, i) => (i === index) ? tabcontent.style.display = 'block' : tabcontent.style.display = 'none');
		const tablinks = [...this._root.querySelectorAll('.tablink')];
		tablinks.forEach((tablink, i) => (i === index) ? tablink.classList.add('tablink-active') : tablink.classList.remove('tablink-active'));
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	/**
	* @override
	*/
	onAfterRender() {
		this.activateTab(this._activeTabIndex);
	}

	//needs to be refactored to a seperate component later
	_createDataPanel() {
		const onSelect = (data) => {
			addLayer(data.id, { label: data.label });
		};
		return html`
		<div style="padding: 10px">
			<ba-autocomplete-search class="item1" .onSelect=${onSelect} .provider=${this._georesourceSearchResultProvider}></ba-autocomplete-search>
		</div>
		<div>
			<ba-layer-manager></ba-layer-manager>
		</div>
		`;
	}

	/**
	 * @override
	 */
	createView() {

		const { open } = this._state;
		const { portrait } = this._environmentService.getScreenOrientation();
		const getOverlayClass = () => {
			if (portrait) {
				return open ? 'overlay-portrait overlay-portrait-open' : 'overlay-portrait overlay-portrait-closed';
			}
			else {
				return open ? 'overlay-landscape overlay-landscape-open' : 'overlay-landscape overlay-landscape-closed';
			}
		};
		const getTabBarClass = () => portrait ? 'tab-bar-portrait' : 'tab-bar-landscape';
		const getHeaderClass = () => portrait ? 'header-portrait' : 'header-landscape';


		const items = [
			{ name: 'Data', description: 'Let\'s view geodata', content: this._createDataPanel() },
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
					${portrait ? html`` : html`<a @click="${closeSidePanel}" title = "Close menu" > <span class="icon close"></a>`}
				</div>	
				<!-- Overlay content -->
				<div class="overlay-content">
					${items.map(item => html`
						<div class="tabcontent">
							<!-- <h1>${item.name}</h1>-->
							<p>${item.description}</p>
							${item.content ? item.content : nothing}
						</div>
					`)}
				</div>
			</div>
		`;
	}

	/**
	 * @override
	 * @param {Object} state 
	 */
	extractState(state) {
		const { sidePanel: { open } } = state;
		return { open };
	}

	static get tag() {
		return 'ba-side-panel';
	}
}
