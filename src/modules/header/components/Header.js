import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { toggleContentPanel } from '../../menue/store/contentPanel.action';
import { openModal } from '../../modal/store/modal.action';
import { $injector } from '../../../injection';
// import { changeZoomAndCenter } from '../../map/store/position.action';
import css from './header.css';


/**
 * Container element for header stuff. 
 * @class
 * @author aul
 */
export class Header extends BaElement {

	constructor() {
		super();

		const { CoordinateService, EnvironmentService, SearchResultProviderService: providerService } = $injector.inject('CoordinateService', 'EnvironmentService', 'SearchResultProviderService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
		this._locationSearchResultProvider = providerService.getLocationSearchResultProvider();
		this._menueButtonLocked = false;
		this._portrait = false;
	}

	initialize() {

		//MediaQuery for 'orientation'
		const mediaQuery = window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e) => {
			this._portrait = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQuery.addEventListener('change',  handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);
	}


	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	createView() {

		// const getDeviceClass = (prefix) => (mobile ? prefix + '-mobile' : prefix + '-desktop');
		const getTitle = () => {
			const { contentPanelIsOpen } = this._state;
			return contentPanelIsOpen ? 'Close menue' : 'Open menue';
		};

		const toggleContentPanelGuarded = () => {

			if (!this._menueButtonLocked) {
				this._menueButtonLocked = true;
				toggleContentPanel();
				window.setTimeout(() => this._menueButtonLocked = false, Header.menueButtonLockDuration);
			}
		};

		const showModalInfo = () => {
			const payload = { title: 'Showcase', content: html`<ba-showcase></ba-showcase>` };
			openModal(payload);
		};

		const getOrientationClass = () => {
			return this._portrait ? 'portrait' : 'landscape';
		};



		return html`
			<style>${css}</style>
			<div class="${getOrientationClass()}">
				<div  class="header">    
					<div  style="display: flex">
						<input   type="search"/>             
						<button @click="${showModalInfo}" class="header__modal-button" title="modal">
							M
						</button>
					</div>
					<div  class="header__button-container">
						<button title="${getTitle()}" @click="${toggleContentPanelGuarded}">
							Themen
						</button>
						<button title="${getTitle()}" @click="${toggleContentPanelGuarded}">
							Dargestellte Karten
						</button>
						<button title="${getTitle()}" @click="${toggleContentPanelGuarded}">
							mehr
						</button>
					</div>
				</div>
            </div>
		`;
	}

	/**
	 * 
	 * @param {@override} store 
	 */
	extractState(store) {
		const { contentPanel: { open } } = store;
		return { contentPanelIsOpen: open };
	}

	static get tag() {
		return 'ba-header';
	}

	static get menueButtonLockDuration() {
		return 500;
	}
}