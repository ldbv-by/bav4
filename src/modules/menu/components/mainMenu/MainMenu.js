import { html, nothing } from 'lit-html';
import { BaElement, renderTagOf } from '../../../BaElement';
import css from './mainMenu.css';
import { toggle } from '../../store/mainMenu.action';
import { $injector } from '../../../../injection';
import { DevInfo } from '../../../utils/components/devInfo/DevInfo';
import { TopicsContentPanel } from '../../../topics/components/menu/TopicsContentPanel';
import { SearchResultsPanel } from '../../../search/components/menu/SearchResultsPanel';
import { clearHighlightFeatures } from '../../../../store/highlight/highlight.action';
import { FeatureInfoPanel } from '../../../featureInfo/components/FeatureInfoPanel';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

/**
 * @enum
 */
export const MainMenuTabIndex = Object.freeze({
	TOPICS: { id: 0, component: TopicsContentPanel },
	MAPS: { id: 1, component: null },
	MORE: { id: 2, component: null },
	ROUTING: { id: 3, component: null },
	SEARCH: { id: 4, component: SearchResultsPanel },
	FEATUREINFO: { id: 5, component: FeatureInfoPanel }
});


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
		this._activeTabIndex = 0;
	}

	_activateTab(index) {
		const tabcontents = [...this._root.querySelectorAll('.tabcontent')];
		tabcontents.forEach((tabcontent, i) => (i === index) ? tabcontent.classList.add('is-active') : tabcontent.classList.remove('is-active'));
	}

	/**
	* @override
	*/
	onAfterRender() {
		this._activateTab(this._activeTabIndex);
	}

	initialize() {

		this.observe('tabIndex', tabIndex => {
			if (tabIndex !== MainMenuTabIndex.SEARCH.id) {
				clearHighlightFeatures();
			}
		});
	}

	/**
	 * @override
	 */
	createView(state) {

		const { open, tabIndex, portrait, minWidth, observeResponsiveParameter } = state;

		this._activeTabIndex = tabIndex;

		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return minWidth ? 'is-desktop' : 'is-tablet';
		};


		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};

		const getPreloadClass = () => {
			return observeResponsiveParameter ? '' : 'prevent-transition';
		};

		const contentPanels = Object.values(MainMenuTabIndex)
		//Todo: refactor me when all content panels are real components
			.map(v => this._getContentPanel(v));

		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>${css}</style>
			<div class="${getOrientationClass()} ${getMinWidthClass()} ${getPreloadClass()}">
				<div class="main-menu ${getOverlayClass()}">            
					<button @click="${toggle}" class="main-menu__close-button">
						<span class='main-menu__close-button-text'>${translate('menu_main_open_button')}</span>	
						<span class='arrow'></span>	
					</button>	
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

	_getContentPanel(definition) {
		//Todo: can be removed when all content panels are real components
		switch (definition) {
			case MainMenuTabIndex.MAPS:
				return this._demoMapContent();
			case MainMenuTabIndex.MORE:
				return this._demoMoreContent();
			case MainMenuTabIndex.SEARCH:
			case MainMenuTabIndex.TOPICS:
			case MainMenuTabIndex.FEATUREINFO:
				return html`${unsafeHTML(`<${definition.component.tag}/>`)}`;
			default:
				return nothing;
		}
	}

	_demoMapContent() {

		return html`
		<div>
			<ba-base-layer-switcher></ba-base-layer-switcher>
			<ba-layer-manager></ba-layer-manager>
		</div>
		`;
	}

	_demoMoreContent() {
		return html`
		<ul class="ba-list">	
		<li class="ba-list-item  ba-list-item__header">
		<span class="ba-list-item__text ">
			<span class="ba-list-item__primary-text">
				Settings
			</span>
		</span>
	</li>		
		<li  class="ba-list-item">
		<span class="ba-list-item__text vertical-center">
		<span class="ba-list-item__primary-text">
		Dark mode
		</span>              
	</span>
	<span class="ba-list-item__after">
	<ba-theme-toggle></ba-theme-toggle>
	</span>
		</li>
		<li  class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum dolor
				</span>
			</span>
		</li>
		<li  class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum dolor
				</span>
			</span>
		</li>
		<li class="ba-list-item  ba-list-item__header">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
					Links
				</span>
			</span>
		</li>
   
		<li class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>             
		<li class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum 
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>             
		<li class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
				Lorem ipsum 
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>          
		<li class="ba-list-item" style="display:none">
			<span class="ba-list-item__pre">
				<span class="ba-list-item__icon">
				</span>
			</span>
			<span class="ba-list-item__text vertical-center">
				<span class="ba-list-item__primary-text">
				Lorem ipsum dolor
				</span>              
			</span>
			<span class="ba-list-item__after">
			<span class="ba-list-item__icon-info">                                
			</span>
		</span>
		</li>  		          
	</ul>
	`;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	/**
	 * @override
	 * @param {Object} globalState
	 */
	extractState(globalState) {
		const { mainMenu: { open, tabIndex }, media: { portrait, minWidth, observeResponsiveParameter } } = globalState;
		return { open, tabIndex, portrait, minWidth, observeResponsiveParameter };
	}

	static get tag() {
		return 'ba-main-menu';
	}
}
