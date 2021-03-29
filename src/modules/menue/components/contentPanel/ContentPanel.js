import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './contentPanel.css';
import { toggleContentPanel } from '../../store/contentPanel.action';
import { $injector } from '../../../../injection';

/**
 *  
 * @class
 * @author alsturm
 */
export class ContentPanel extends BaElement {

	constructor() {
		super();
		const { EnvironmentService : environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
		this._portrait = false;
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

	/**
	 * @override
	 */
	createView() {

		const { open } = this._state;

		const getOrientationClass = () => {
			return this._portrait ? 'portrait' : 'landscape';
		};

		const getMinWidthClass = () => {
			return this._minWidth ? 'is-desktop' : 'is-tablet';
		};


		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};

		return html`
			<style>${css}</style>
			<div class="${getOrientationClass()} ${getMinWidthClass()}">
				<div class="content-panel ${getOverlayClass()}">            
					<button @click="${toggleContentPanel}" class="content-panel__close-button">
					<span class='arrow'></span>	
					</button>	
					<div class='content-panel__container'>
					${this._demoContent()}
					</div>			
				</div>			
			</div>			
		`;
	}

	_demoContent() {
		return html`
		<ul class="ba-list">
		<li class="ba-list-item  ba-list-item__header">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
					Demo Content
				</span>
			</span>
		</li>
   
		<li class="ba-list-item">
			<span class="ba-list-item__pre">
				<span class="ba-list-item__icon">
				</span>
			</span>
			<span class="ba-list-item__text">
				<span class="ba-list-item__primary-text">
					Freizeit in Bayern
				</span>              
			</span>
		</li>
		<li class="ba-list-item">
			<span class="ba-list-item__pre">
				<span class="ba-list-item__icon">
				</span>
			</span>
			<span class="ba-list-item__text">
				<span class="ba-list-item__primary-text">
					Freizeit in Bayern
				</span>              
			</span>
		</li>
		<li class="ba-list-item">
			<span class="ba-list-item__pre">
				<span class="ba-list-item__icon">
				</span>
			</span>
			<span class="ba-list-item__text">
				<span class="ba-list-item__primary-text">
					Freizeit in Bayern
				</span>              
			</span>
		</li>          
		<li  class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
					BayernAtlas-plus
				</span>
			</span>
		</li>
		<li  class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
					Hilfe
				</span>
			</span>
		</li>
		<li  class="ba-list-item">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
					Legende
				</span>
			</span>
		</li>
		<li class="ba-list-item  ba-list-item__header">
			<span class="ba-list-item__text ">
				<span class="ba-list-item__primary-text">
					weitere Links
				</span>
			</span>
		</li>
		<li class="ba-list-item">
			<span class="ba-list-item__text divider">
				<span class="ba-list-item__primary-text">
					Geoportal Bayern
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>             
		<li class="ba-list-item">
			<span class="ba-list-item__text divider">
				<span class="ba-list-item__primary-text">
					Geodaten bestellen
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
				</span>
			</span>
		</li>             
		<li class="ba-list-item">
			<span class="ba-list-item__text divider">
				<span class="ba-list-item__primary-text">
					weitere Portale
				</span>
				<span class="ba-list-item__secondary-text">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr
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
	 * @param {Object} store 
	 */
	extractState(store) {
		const { contentPanel: { open } } = store;
		return { open };
	}

	static get tag() {
		return 'ba-content-panel';
	}
}
