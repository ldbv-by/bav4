import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { open as openMainMenu, setTabIndex } from '../../menu/store/mainMenu.action';
import { openModal } from '../../modal/store/modal.action';
import { $injector } from '../../../injection';
import css from './header.css';
import { MainMenuTabIndex } from '../../menu/components/mainMenu/MainMenu';
import { setQuery } from '../../../store/search/search.action';
import { disableResponsiveParameterObservation, enableResponsiveParameterObservation } from '../../../store/media/media.action';


/**
 * Container element for header stuff. 
 * @class
 * @author taulinger
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
		this._classMobileHeader = '';
	}

	onWindowLoad() {
		if (!this.isRenderingSkipped()) {
			this._root.querySelector('.preload').classList.remove('preload');
		}
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	createView(state) {

		const showModalInfo = () => {
			openModal('Showcase', html`<ba-showcase>`);
		};

		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return minWidth ? 'is-desktop' : 'is-tablet';
		};

		const { open, tabIndex, fetching, layers, portrait, minWidth } = state;

		const getOverlayClass = () => {
			return (open && !portrait) ? 'is-open' : '';
		};

		const getAnimatedBorderClass = () => {
			return fetching ? 'animated-action-button__border__running' : '';
		};

		const getActiveClass = (buttonIndex) => {
			return (tabIndex === buttonIndex) ? 'is-active' : '';
		};

		const layerCount = layers.length;

		const onInputFocus = () => {
			disableResponsiveParameterObservation();
			setTabIndex(MainMenuTabIndex.SEARCH);
			if (portrait || !minWidth) {
				const popup = this.shadowRoot.getElementById('headerMobile');
				popup.style.display = 'none';
				popup.style.opacity = 0;
			}
			//in portrait mode we open the main menu to display existing results
			if (portrait) {
				const value = this.shadowRoot.querySelector('#input').value;
				if (value.length > 0) {
					openMainMenu();
				}
			}
		};

		const onInput = (evt) => {
			openMainMenu();
			setQuery(evt.target.value);
		};

		const onInputBlur = () => {
			enableResponsiveParameterObservation();
			if (portrait || !minWidth) {
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
						<input id='input' @focus="${onInputFocus}" @blur="${onInputBlur}" @input="${onInput}" class='header__search' type="search" placeholder="" />             
						<button @click="${showModalInfo}" class="header__modal-button" title="modal">
						&nbsp;
						</button>
					</div>
					<div  class="header__button-container">
						<button class="${getActiveClass(0)}" title=${translate('header_tab_topics_title')} @click="${openTopicsTab}">
							<span>
								${translate('header_tab_topics_button')}
							</span>
						</button>
						<button class="${getActiveClass(1)}" title=${translate('header_tab_maps_title')}  @click="${openMapLayerTab}">
							<span>
								${translate('header_tab_maps_button')}
							</span>
							 <span class="badges">
							 	${layerCount}
							</span>
						</button>
						<button class="${getActiveClass(2)}" title=${translate('header_tab_more_title')}  @click="${openMoreTab}">
							<span>
								${translate('header_tab_more_button')}
							</span>
						</button>
					</div>
				</div>				
            </div>
		`;
	}

	/**
	 * @override
	 * @param {Object} globalState 
	 */
	extractState(globalState) {
		const { mainMenu: { open, tabIndex }, network: { fetching }, layers: { active: layers }, media: { portrait, minWidth } } = globalState;
		return { open, tabIndex, fetching, layers, portrait, minWidth };
	}

	static get tag() {
		return 'ba-header';
	}
}
