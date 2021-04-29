import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { open as openMainMenu, setTabIndex } from '../../menu/store/mainMenu.action';
import { openModal } from '../../modal/store/modal.action';
import { $injector } from '../../../injection';
import css from './header.css';
import { MainMenuTabIndex } from '../../menu/components/mainMenu/MainMenu';
import { setQuery } from '../../../store/search/search.action';


/**
 * Container element for header stuff. 
 * @class
 * @author aul
 * @author alsturm
 */
export class Header extends BaElement {

	constructor() {
		super();

		const {
			CoordinateService: coordinateService,
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('CoordinateService', 'EnvironmentService', 'TranslationService');

		this._coordinateService = coordinateService;
		this._environmentService = environmentService;
		this._translationService = translationService;
		this._portrait = false;
		this._classMobileHeader = '';
	}

	initialize() {
		const _window = this._environmentService.getWindow();

		//MediaQuery for 'orientation'
		const mediaQuery = _window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e) => {
			this._portrait = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQuery.addEventListener('change', handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);

		//MediaQuery for 'min-width'
		const mediaQueryMinWidth = _window.matchMedia('(min-width: 80em)');
		const handleMinWidthChange = (e) => {
			this._minWidth = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQueryMinWidth.addEventListener('change', handleMinWidthChange);
		//initial set of local state
		handleMinWidthChange(mediaQueryMinWidth);
	}


	onWindowLoad() {
		if (!this.isRenderingSkipped()) {
			this._root.querySelector('.preload').classList.remove('preload');
		}
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
			return this._portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return this._minWidth ? 'is-desktop' : 'is-tablet';
		};

		const { open, tabIndex, fetching } = this._state;

		const getOverlayClass = () => {
			return (open && !this._portrait) ? 'is-open' : '';
		};

		const getAnimatedBorderClass = () => {
			return fetching ? 'animated-action-button__border__running' : '';
		};

		const getActiveClass = (buttonIndex) => {
			return (tabIndex === buttonIndex) ? 'is-active' : '';
		};

		const { layers } = this._state;
		const layerCount = layers.length;

		const onFocusInput = () => {
			setTabIndex(MainMenuTabIndex.SEARCH);
			if (this._portrait || !this._minWidth) {
				const popup = this.shadowRoot.getElementById('headerMobile');
				popup.style.display = 'none';
				popup.style.opacity = 0;
			}
		};

		const onInput = (evt) => setQuery(evt.target.value);

		const showModalHeader = () => {
			if (this._portrait || !this._minWidth) {
				const popup = this.shadowRoot.getElementById('headerMobile');
				popup.style.display = '';
				window.setTimeout(() => popup.style.opacity = 1, 300);
			}
		};

		const openTopicsTab = () => {
			setTabIndex(MainMenuTabIndex.TOPICS);
			openMainMenu();
		};

		const openMapLayerTab = () => {
			setTabIndex(MainMenuTabIndex.MAPS);
			openMainMenu();
		};

		const openMoreTab = () => {
			setTabIndex(MainMenuTabIndex.MORE);
			openMainMenu();
		};

		const translate = (key) => this._translationService.translate(key);
		return html`
			<style>${css}</style>
			<div class="preload ${getOrientationClass()} ${getMinWidthClass()}">
				<div class='header__logo'>				
					<button class="action-button">
						<div class="action-button__border animated-action-button__border ${getAnimatedBorderClass()}">
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
						<input @focus="${onFocusInput}" @blur="${showModalHeader}" @input="${onInput}" class='header__search' type="search" placeholder="" />             
						<button @click="${showModalInfo}" class="header__modal-button" title="modal">
						&nbsp;
						</button>
					</div>
					<div  class="header__button-container">
						<button class="${getActiveClass(0)}" title="opens menu 0" @click="${openTopicsTab}">
							<span>
								${translate('header_header_topics_button')}
							</span>
						</button>
						<button class="${getActiveClass(1)}" title="opens menu 1"  @click="${openMapLayerTab}">
							<span>
								${translate('header_header_maps_button')}
							</span>
							 <span class="badges">
							 	${layerCount}
							</span>
						</button>
						<button class="${getActiveClass(2)}" title="opens menu 2"  @click="${openMoreTab}">
							<span>
								${translate('header_header_more_button')}
							</span>
						</button>
					</div>
				</div>				
            </div>
		`;
	}

	/**
	 * @override
	 * @param {Object} state 
	 */
	extractState(state) {
		const { mainMenu: { open, tabIndex }, network: { fetching }, layers: { active: layers } } = state;
		return { open, tabIndex, fetching, layers };
	}

	static get tag() {
		return 'ba-header';
	}
}
