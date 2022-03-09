import { html, nothing } from 'lit-html';
import { BaElement, renderTagOf } from '../../../BaElement';
import css from './mainMenu.css';
import { $injector } from '../../../../injection';
import { DevInfo } from '../../../utils/components/devInfo/DevInfo';
import { TopicsContentPanel } from '../../../topics/components/menu/TopicsContentPanel';
import { SearchResultsPanel } from '../../../search/components/menu/SearchResultsPanel';
import { TabId, toggle } from '../../../../store/mainMenu/mainMenu.action';
import { FeatureInfoPanel } from '../../../featureInfo/components/FeatureInfoPanel';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { MapsContentPanel } from './content/maps/MapsContentPanel';
import { BvvMiscContentPanel } from './content/misc/BvvMiscContentPanel';

const threshold = 150; //required min distance traveled to be considered swipe
const restraint = 100; // maximum distance allowed at the same time in perpendicular direction
const			allowedTime = 300; // maximum time allowed to travel that distance
/**
 *
 * @class
 * @author alsturm
 * @author taulinger
 */
export class MainMenu extends BaElement {

	constructor() {
		super();
		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject('EnvironmentService', 'TranslationService');
		this._environmentService = environmentService;
		this._translationService = translationService;
		this._activeTab = null;
		this._swipedir = 'none';
		this._startY = null;
		this._startTime = null;
	}

	_activateTab(key) {
		const tabcontents = [...this._root.querySelectorAll('.tabcontent')];
		tabcontents.forEach((tabcontent, i) => (Object.values(TabId)[i] === key) ? tabcontent.classList.add('is-active') : tabcontent.classList.remove('is-active'));
	}

	/**
	* @override
	*/
	onAfterRender() {
		this._activateTab(this._activeTab);
	}

	/**
	 * @override
	 */
	createView(state) {

		const { open, tab, portrait, minWidth, observeResponsiveParameter } = state;

		this._activeTab = tab;

		const getOrientationClass = () => portrait ? 'is-portrait' : 'is-landscape';

		const getMinWidthClass = () => minWidth ? 'is-desktop' : 'is-tablet';

		const getFullSizeClass = () => (tab === TabId.FEATUREINFO) ? 'is-full-size' : '';

		const getOverlayClass = () => open ? 'is-open' : '';

		const getPreloadClass = () => observeResponsiveParameter ? '' : 'prevent-transition';

		const contentPanels = Object.values(TabId)
			.map(v => this._getContentPanel(v));

		const translate = (key) => this._translationService.translate(key);

		const changeWidth = (event) => {
			const container = this.shadowRoot.getElementById('mainmenu');
			container.style.width = parseInt(event.target.value) + 'em';
		};

		const getSlider = () => {

			const onPreventDragging = (e) => {
				e.preventDefault();
				e.stopPropagation();
			};

			return html`<div class='slider-container'>
				<input  
					type="range" 
					min="28" 
					max="100" 
					value="28" 
					draggable='true' 
					@input=${changeWidth} 
					@dragstart=${onPreventDragging}
					></div>`;
		};

		const onTouchStart = (e) => {
			const touchobj = e.changedTouches[0];
			this._swipedir = 'none';

			this._startY = touchobj.pageY;
			this._startTime = new Date().getTime(); // record time when finger first makes contact with surface
			e.preventDefault();

		};
		const onTouchMove = (e) => {
			e.preventDefault();
		};
		const onTouchEnd = (e) => {
			const touchobj = e.changedTouches[0];

			const distY = touchobj.pageY - this._startY; // get vertical dist traveled by finger while in contact with surface
			const elapsedTime = new Date().getTime() - this._startTime; // get time elapsed
			if (elapsedTime <= allowedTime) { // first condition for awipe met
				if (Math.abs(distY) >= threshold) { // 2nd condition for vertical swipe met
					this._swipedir = (this._distY < 0) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
				}
			}
			//e.preventDefault();
			console.log(distY);
			if (this._swipedir !== 'up') {
				toggle();
			}
		};


		return html`
			<style>${css}</style>
			<div class="${getOrientationClass()} ${getPreloadClass()}">
				<div id='mainmenu' class="main-menu ${getOverlayClass()} ${getMinWidthClass()} ${getFullSizeClass()}">            
					<button id='test' @click="${toggle}" @touchstart=${onTouchStart} @touchmove=${onTouchMove} @touchend=${onTouchEnd} title=${translate('menu_main_open_button')} class="main-menu__close-button">
						<span class='main-menu__close-button-text'>${translate('menu_main_open_button')}</span>	
						<i class='resize-icon'></i>	
					</button>	
					${getSlider()} 
					<div id='mainMenuContainer' class='main-menu__container'>					
						<div class="overlay-content">
							${contentPanels.map(item => html`
								<div class="tabcontent">						
									${item}
								</div>								
							`)}
						</div>
					</div>		
					<div>
						${renderTagOf(DevInfo)}	
					</div>	
				</div>			
			</div>			
		`;
	}

	_getContentPanel(index) {
		switch (index) {
			case TabId.MAPS:
				return html`${unsafeHTML(`<${MapsContentPanel.tag}/>`)}`;
			case TabId.MISC:
				return html`${unsafeHTML(`<${BvvMiscContentPanel.tag}/>`)}`;
			case TabId.SEARCH:
				return html`${unsafeHTML(`<${SearchResultsPanel.tag}/>`)}`;
			case TabId.TOPICS:
				return html`${unsafeHTML(`<${TopicsContentPanel.tag}/>`)}`;
			case TabId.FEATUREINFO:
				return html`${unsafeHTML(`<${FeatureInfoPanel.tag}/>`)}`;
			default:
				return nothing;
		}
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	/**
	 * @override
	 * @param {Object} globalState
	 */
	extractState(globalState) {
		const { mainMenu: { open, tab }, media: { portrait, minWidth, observeResponsiveParameter } } = globalState;
		return { open, tab, portrait, minWidth, observeResponsiveParameter };
	}

	static get tag() {
		return 'ba-main-menu';
	}
}
