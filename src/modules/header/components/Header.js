import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { openContentPanel } from '../../menue/store/contentPanel.action';
import { openModal } from '../../modal/store/modal.action';
import { $injector } from '../../../injection';
// import { changeZoomAndCenter } from '../../map/store/position.action';
import css from './header.css';


/**
 * Container element for header stuff. 
 * @class
 * @author aul
 * @author alsturm
 */
export class Header extends BaElement {

	constructor() {
		super();

		const { CoordinateService, EnvironmentService, SearchResultProviderService: providerService } = $injector.inject('CoordinateService', 'EnvironmentService', 'SearchResultProviderService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
		this._locationSearchResultProvider = providerService.getLocationSearchResultProvider();
		this._portrait = false;
		this._classMobileHeader = '';
	}

	initialize() {

		//MediaQuery for 'orientation'
		const mediaQuery = window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e) => {
			this._portrait = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQuery.addEventListener('change', handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);

		//MediaQuery for 'min-width'
		const mediaQueryMinWidth = window.matchMedia('(min-width: 80em)');
		const handleMinWidthChange = (e) => {
			this._minWidth = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQueryMinWidth.addEventListener('change', handleMinWidthChange);
		//initial set of local state
		handleMinWidthChange(mediaQueryMinWidth);
	}


	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	createView() {

		const showModalInfo = () => {
			const payload = { title: 'Showcase', content: html`<ba-showcase></ba-showcase>` };
			openModal(payload);
		};

		const getOrientationClass = () => {
			return this._portrait ? 'portrait' : 'landscape';
		};

		const getMinWidthClass = () => {
			return this._minWidth ? 'is-desktop'  : 'is-tablet';
		};

		const { open } = this._state;

		const getOverlayClass = () => {
			return (open && !this._portrait) ? 'is-open' : '';
		};
		
		const hideModalHeader = () => {
			const popup = this.shadowRoot.getElementById('headerMobile');	
			if (this._portrait || !this._minWidth) {
				popup.style.display = 'none';
				popup.style.opacity = 0;
			}
		};

		const showModalHeader = () => {
			const popup = this.shadowRoot.getElementById('headerMobile');	
			if (this._portrait || !this._minWidth) {
				popup.style.display = '';
				window.setTimeout(() => popup.style.opacity = 1, 300);				
			}
		};

		return html`
			<style>${css}</style>
			<div class="${getOrientationClass()} ${getMinWidthClass()}">
				<div class='header__logo'>				
					<button   class="action-button">
						<div class="action-button__border">
						</div>
						<div class="action-button__icon">
							<div class="ba">
							</div>
						</div>
					</button>
					<div class='header__text'>
					</div>
					<div class='header__emblem'>
					</div>
				</div>			
				<div id='headerMobile' class='header__text-mobile'>	
				</div>
				<div  class="header ${getOverlayClass()}">   
				<mask class="header__background">
				</mask>
					<div class='header__search-container'>
						<input @focus="${hideModalHeader}" @blur="${showModalHeader}" class='header__search' type="search" placeholder="" />             
						<button @click="${showModalInfo}" class="header__modal-button" title="modal">
						&nbsp;
						</button>
					</div>
					<div  class="header__button-container">
						<button title="opens menu 0" @click="${openContentPanel}">
							Themen
						</button>
						<button title="opens menu 1" @click="${openContentPanel}">
							Dargestellte Karten
						</button>
						<button title="opens menu 2" @click="${openContentPanel}">
							mehr
						</button>
					</div>
				</div>				
            </div>
		`;
	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { contentPanel: { open } } = store;
		return { open };
	}

	static get tag() {
		return 'ba-header';
	}
}
