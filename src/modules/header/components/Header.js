import { html } from 'lit-html';
import { open as openMainMenu, setTab, TabId, toggle } from '../../../store/mainMenu/mainMenu.action';
import { $injector } from '../../../injection';
import css from './header.css';
import { setQuery } from '../../../store/search/search.action';
import { disableResponsiveParameterObservation, enableResponsiveParameterObservation } from '../../../store/media/media.action';
import { MvuElement } from '../../MvuElement';
import { closeModal, openModal } from '../../../store/modal/modal.action';
import VanillaSwipe from 'vanilla-swipe';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { sleep } from '../../../utils/sleep';

const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_Fetching = 'update_fetching';
const Update_Layers = 'update_layers';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_HasSearchTerm = 'update_hasSearchTerm';

/**
 * Container element for header stuff.
 * @class
 * @author taulinger
 * @author alsturm
 */
export class Header extends MvuElement {

	constructor() {
		super({
			isOpen: false,
			tabIndex: null,
			isFetching: false,
			layers: [],
			isPortrait: false,
			hasMinWidth: false,
			hasSearchTerm: false
		});

		const {
			CoordinateService: coordinateService,
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('CoordinateService', 'EnvironmentService', 'TranslationService');

		this._coordinateService = coordinateService;
		this._environmentService = environmentService;
		this._translationService = translationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsOpen_TabIndex:
				return { ...model, ...data };
			case Update_Fetching:
				return { ...model, isFetching: data };
			case Update_Layers:
				return { ...model, layers: data };
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_HasSearchTerm:
				return { ...model, hasSearchTerm: data };
		}
	}

	onInitialize() {
		this.observe(state => state.mainMenu, mainMenu => this.signal(Update_IsOpen_TabIndex, { isOpen: mainMenu.open, tabIndex: mainMenu.tab }));
		this.observe(state => state.network.fetching, fetching => this.signal(Update_Fetching, fetching));
		this.observe(state => state.layers.active, active => this.signal(Update_Layers, active.filter(l => l.constraints.hidden === false)));
		this.observe(state => state.media, media => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth }));
	}

	onAfterRender(firsttime) {
		if (firsttime) {

			const handler = (event, data) => {
				if (['touchmove', 'mousemove'].includes(event.type) && data.directionX === 'LEFT' && data.absX > Header.SWIPE_DELTA_PX) {
					swipeElement.focus();
					toggle();
				}
			};
			const swipeElement = this.shadowRoot.getElementById('header_toggle');

			const swipe = new VanillaSwipe({
				element: swipeElement,
				onSwipeStart: handler,
				delta: Header.SWIPE_DELTA_PX,
				mouseTrackingEnabled: true
			});

			swipe.init();
		}
	}

	onWindowLoad() {
		if (!this.isRenderingSkipped()) {
			this._root.querySelector('.preload').classList.remove('preload');
		}
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	createView(model) {

		const { isOpen, tabIndex, isFetching, layers, isPortrait, hasMinWidth, hasSearchTerm } = model;

		// const showModalInfo = () => {
		// 	openModal('Showcase', html`<ba-showcase>`);
		// };

		// fixme: only temporal, remove after established implementation of BaaCredentialsService
		const showCredentialsPanel = () => {
			const securedId = 'https://holymoly.awesome.com/your/super/secret/map/wms';
			const receivedCredentials = { username: null, password: null };
			const onCheck = async (id, credentials) => {
				await sleep(3000);
				if (id === securedId && credentials?.username === 'foo' && credentials?.password === 'bar') {
					receivedCredentials.username = credentials.username;
					receivedCredentials.password = credentials.password;
					return true;
				}
				return false;
			};

			const onResolved = (credentials) => {
				if (credentials) {
					closeModal();
				}
				emitNotification('Authentication aborted', LevelTypes.WARN);
			};
			openModal('Mit geschützten WMS verbinden...', html`<ba-auth-baa-credentials-panel .id=${securedId} .onCheck=${onCheck} .onResolved=${onResolved}>`);
		};

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return (isOpen && !isPortrait) ? 'is-open' : '';
		};

		const getAnimatedBorderClass = () => {
			return isFetching ? 'animated-action-button__border__running' : '';
		};

		const getActiveClass = (buttonIndex) => {
			return (tabIndex === buttonIndex) ? 'is-active' : '';
		};

		const getIsClearClass = () => {
			return hasSearchTerm ? 'is-clear-visible' : '';
		};

		const layerCount = layers.length;

		const onInputFocus = () => {
			disableResponsiveParameterObservation();
			setTab(TabId.SEARCH);
			if (isPortrait || !hasMinWidth) {
				const popup = this.shadowRoot.getElementById('headerMobile');
				popup.style.display = 'none';
				popup.style.opacity = 0;
			}

			//in portrait mode we open the main menu to display existing results
			if (isPortrait) {
				const value = this.shadowRoot.querySelector('#input').value;
				if (value.length > 0) {
					openMainMenu();
				}
			}
		};

		const onInput = (evt) => {
			const term = evt.target.value;
			openMainMenu();
			setQuery(term);
			this.signal(Update_HasSearchTerm, !!term);
		};

		const onInputBlur = () => {
			enableResponsiveParameterObservation();
			if (isPortrait || !hasMinWidth) {
				const popup = this.shadowRoot.getElementById('headerMobile');
				popup.style.display = '';
				window.setTimeout(() => popup.style.opacity = 1, 300);
			}
		};

		const openTopicsTab = () => {
			setTab(TabId.TOPICS);
			openMainMenu();
		};

		const openMapLayerTab = () => {
			setTab(TabId.MAPS);
			openMainMenu();
		};

		const openMiscTab = () => {
			setTab(TabId.MISC);
			openMainMenu();
		};

		const clearSearchInput = () => {
			const input = this.shadowRoot.getElementById('input');
			input.value = '';
			input.focus();
			input.dispatchEvent(new Event('input'));
		};

		const translate = (key) => this._translationService.translate(key);
		return html`
			<style>${css}</style>
			<div class="preload">
				<div class="${getOrientationClass()} ${getMinWidthClass()}">
					<div class='header__logo'>				
						<div class="action-button">
							<div class="action-button__border animated-action-button__border ${getAnimatedBorderClass()}">
							</div>
							<div class="action-button__icon">
								<div class="ba">
								</div>
							</div>
						</div>
						<div id='header__text' class='${getOverlayClass()} header__text'>
						</div>
						<div class='header__logo-badge'>										
							${translate('header_logo_badge')}
						</div>	
					</div>		
					<div id='headerMobile' class='${getOverlayClass()} header__text-mobile'>	
					</div>
					<div class='header__emblem'>
					</div>
					<div  class="header ${getOverlayClass()}">  
						<button id='header_toggle' class="close-menu" title=${translate('header_close_button_title')}  @click="${toggle}"">
							<i class="resize-icon "></i>
						</button> 
						<div class="header__background">
						</div>
						<div class='header__search-container'>
							<input id='input' data-test-id placeholder='${translate('header_search_placeholder')}' @focus="${onInputFocus}" @blur="${onInputBlur}" @input="${onInput}" class='header__search' type="search" placeholder="" />          
							<span class="header__search-clear ${getIsClearClass()}" @click="${clearSearchInput}">        							
							</span>       
							<button @click="${showCredentialsPanel}" class="header__modal-button" title="modal">
							&nbsp;
							</button>
						</div>
						<div  class="header__button-container">
							<button id="topics_button" data-test-id class="${getActiveClass(TabId.TOPICS)}" title=${translate('header_tab_topics_title')} @click="${openTopicsTab}">
								<span>
									${translate('header_tab_topics_button')}
								</span>
							</button>
							<button id="maps_button" data-test-id class="${getActiveClass(TabId.MAPS)}" title=${translate('header_tab_maps_title')}  @click="${openMapLayerTab}">
								<span>
									${translate('header_tab_maps_button')}
								</span>
								<div class="badges">
									${layerCount}
								</div>
							</button>
							<button id="misc_button" data-test-id class="${getActiveClass(TabId.MISC)}" title=${translate('header_tab_misc_title')}  @click="${openMiscTab}">
								<span>
									${translate('header_tab_misc_button')}
								</span>
							</button>
						</div>
					</div>				
				</div>
            </div>
		`;
	}

	static get SWIPE_DELTA_PX() {
		return 50;
	}

	static get tag() {
		return 'ba-header';
	}
}
