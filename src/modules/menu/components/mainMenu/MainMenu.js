/**
 * @module modules/menu/components/mainMenu/MainMenu
 */
import { html, nothing } from 'lit-html';
import css from './mainMenu.css';
import { $injector } from '../../../../injection';
import { DevInfo } from '../../../utils/components/devInfo/DevInfo';
import { TopicsContentPanel } from '../../../topics/components/menu/TopicsContentPanel';
import { SearchResultsPanel } from '../../../search/components/menu/SearchResultsPanel';
import { toggle } from '../../../../store/mainMenu/mainMenu.action';
import { TabIds } from '../../../../domain/mainMenu';
import { FeatureInfoPanel } from '../../../featureInfo/components/featureInfoPanel/FeatureInfoPanel';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { MapsContentPanel } from './content/maps/MapsContentPanel';
import { BvvMiscContentPanel } from './content/misc/BvvMiscContentPanel';
import { MvuElement } from '../../../MvuElement';
import VanillaSwipe from 'vanilla-swipe';

const Update_Main_Menu = 'update_main_menu';
const Update_Media = 'update_media';

/**
 *
 * @class
 * @author alsturm
 * @author taulinger
 * @author thiloSchlemmer
 */
export class MainMenu extends MvuElement {
	constructor() {
		super({
			tab: null,
			open: false,
			portrait: false,
			minWidth: false,
			observeResponsiveParameter: false
		});
		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject(
			'EnvironmentService',
			'TranslationService'
		);
		this._environmentService = environmentService;
		this._translationService = translationService;
	}

	onInitialize() {
		this.observe(
			(state) => state.mainMenu,
			(data) => this.signal(Update_Main_Menu, data),
			true
		);
		this.observe(
			(state) => state.media,
			(data) => this.signal(Update_Media, data),
			true
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Main_Menu:
				return {
					...model,
					open: data.open,
					tab: data.tab
				};
			case Update_Media:
				return {
					...model,
					portrait: data.portrait,
					minWidth: data.minWidth,
					observeResponsiveParameter: data.observeResponsiveParameter
				};
		}
	}

	_activateTab(key) {
		const tabcontents = [...this._root.querySelectorAll('.tabcontent')];
		tabcontents.forEach((tabcontent, i) =>
			Object.values(TabIds)[i] === key ? tabcontent.classList.add('is-active') : tabcontent.classList.remove('is-active')
		);
	}

	/**
	 * @override
	 */
	onAfterRender(firsttime) {
		const { tab } = this.getModel();
		this._activateTab(tab);
		if (firsttime) {
			const handler = (event, data) => {
				if (['touchmove', 'mousemove'].includes(event.type) && data.directionY === 'TOP' && data.absY > MainMenu.SWIPE_DELTA_PX) {
					swipeElement.focus();
					toggle();
				}
			};
			const swipeElement = this.shadowRoot.getElementById('toggle');

			const swipe = new VanillaSwipe({
				element: swipeElement,
				onSwipeStart: handler,
				delta: MainMenu.SWIPE_DELTA_PX,
				mouseTrackingEnabled: true
			});

			swipe.init();
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { open, tab, portrait, minWidth, observeResponsiveParameter } = model;

		const getOrientationClass = () => (portrait ? 'is-portrait' : 'is-landscape');

		const getMinWidthClass = () => (minWidth ? 'is-desktop' : 'is-tablet');

		const getFullSizeClass = () => (tab === TabIds.FEATUREINFO ? 'is-full-size' : '');

		const getOverlayClass = () => (open ? 'is-open' : '');

		const getPreloadClass = () => (observeResponsiveParameter ? '' : 'prevent-transition');

		const contentPanels = Object.values(TabIds).map((v) => this._getContentPanel(v));

		const translate = (key) => this._translationService.translate(key);

		const changeWidth = (event) => {
			const container = this.shadowRoot.getElementById('mainmenu');
			container.style.width = parseInt(event.target.value) + 'em';
		};

		const getValue = () => {
			const container = this.shadowRoot.getElementById('mainmenu');
			return container && container.style.width !== '' ? parseInt(container.style.width) : MainMenu.INITIAL_WIDTH_EM;
		};

		const getSlider = () => {
			const onPreventDragging = (e) => {
				e.preventDefault();
				e.stopPropagation();
			};

			return html`<div class="slider-container">
				<input
					id="rangeslider"
					type="range"
					min="${MainMenu.MIN_WIDTH_EM}"
					max="${MainMenu.MAX_WIDTH_EM}"
					value="${getValue()}"
					draggable="true"
					@input=${changeWidth}
					@dragstart=${onPreventDragging}
				/>
			</div>`;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="${getOrientationClass()} ${getPreloadClass()}">
				<div id="mainmenu" class="main-menu ${getOverlayClass()} ${getMinWidthClass()} ${getFullSizeClass()}">
					<button id="toggle" @click="${toggle}" title=${translate('menu_main_open_button')} class="main-menu__close-button">
						<span class="main-menu__close-button-text">${translate('menu_main_open_button')}</span>
						<i class="resize-icon"></i>
					</button>
					${getSlider()}
					<div id="mainMenuContainer" class="main-menu__container" ?data-register-for-viewport-calc=${!portrait}>
						<div class="overlay-content">${contentPanels.map((item) => html` <div class="tabcontent">${item}</div> `)}</div>
					</div>
					<div>${this._getDevInfo()}</div>
				</div>
			</div>
		`;
	}

	_getContentPanel(index) {
		switch (index) {
			case TabIds.MAPS:
				return html`${unsafeHTML(`<${MapsContentPanel.tag} data-test-id />`)}`;
			case TabIds.MISC:
				return html`${unsafeHTML(`<${BvvMiscContentPanel.tag} data-test-id />`)}`;
			case TabIds.SEARCH:
				return html`${unsafeHTML(`<${SearchResultsPanel.tag} data-test-id />`)}`;
			case TabIds.TOPICS:
				return html`${unsafeHTML(`<${TopicsContentPanel.tag} data-test-id />`)}`;
			case TabIds.FEATUREINFO:
				return html`${unsafeHTML(`<${FeatureInfoPanel.tag} data-test-id />`)}`;
			default:
				return nothing;
		}
	}

	_getDevInfo() {
		return html`${unsafeHTML(`<${DevInfo.tag}/>`)}`;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get SWIPE_DELTA_PX() {
		return 50;
	}

	static get INITIAL_WIDTH_EM() {
		return 28;
	}

	static get MIN_WIDTH_EM() {
		return 28;
	}

	static get MAX_WIDTH_EM() {
		return 100;
	}

	/**
	 * @override
	 * @param {Object} globalState
	 */

	static get tag() {
		return 'ba-main-menu';
	}
}
