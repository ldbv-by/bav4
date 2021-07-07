import { html, nothing } from 'lit-html';
import { BaElement, renderTagOf } from '../../../BaElement';
import css from './mainMenu.css';
import { toggle } from '../../store/mainMenu.action';
import { $injector } from '../../../../injection';
import { DevInfo } from '../../../utils/components/devInfo/DevInfo';
import { TopicsContentPanel } from '../../../topics/components/menu/TopicsContentPanel';
import { SearchResultsPanel } from '../../../search/components/menu/SearchResultsPanel';
import { clearHighlightFeatures } from '../../../../store/highlight/highlight.action';

/**
 * @enum
 */
export const MainMenuTabIndex = Object.freeze({
	TOPICS: { id: 0, component: TopicsContentPanel },
	MAPS: { id: 1, component: null },
	MORE: { id: 2, component: null },
	ROUTING: { id: 3, component: null },
	SEARCH: { id: 4, component: SearchResultsPanel },
	FEATUREINFO: { id: 5, component: null }
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
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
		this._portrait = false;
		this._activeTabIndex = 0;
	}

	_activateTab(index) {
		const tabcontents = [...this._root.querySelectorAll('.tabcontent')];
		tabcontents.forEach((tabcontent, i) => (i === index) ? tabcontent.style.display = 'block' : tabcontent.style.display = 'none');
	}

	/**
	* @override
	*/
	onAfterRender() {
		this._activateTab(this._activeTabIndex);
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

		const { open, tabIndex } = state;

		this._activeTabIndex = tabIndex;

		const getOrientationClass = () => {
			return this._portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return this._minWidth ? 'is-desktop' : 'is-tablet';
		};


		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};

		const contentPanels = Object.values(MainMenuTabIndex)
		//Todo: refactor me when all content panels are real components	
			.map(v => this._getContentPanel(v));


		return html`
			<style>${css}</style>
			<div class="${getOrientationClass()} ${getMinWidthClass()}">
				<div class="main-menu ${getOverlayClass()}">            
					<button @click="${toggle}" class="main-menu__close-button">
						<span class='main-menu__close-button-text'> Menü öffnen </span>	
						<span class='arrow'></span>	
					</button>	
					<div id='mainMenuContainer' class='main-menu__container'>					
						<div class="overlay-content">
							${contentPanels.map(item => html`
								<div class="tabcontent">						
									${item ? item : nothing}
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
		//Todo: can be removed when all content panels are real components
		switch (index) {
			case MainMenuTabIndex.MAPS:
				return this._demoMapContent();
			case MainMenuTabIndex.MORE:
				return this._demoMoreContent();
			case MainMenuTabIndex.SEARCH:
			case MainMenuTabIndex.TOPICS:
				return html`${renderTagOf(index.component)}`;
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
		Lorem ipsum dolor
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
		const { mainMenu: { open, tabIndex } } = globalState;
		return { open, tabIndex };
	}

	static get tag() {
		return 'ba-main-menu';
	}
}
