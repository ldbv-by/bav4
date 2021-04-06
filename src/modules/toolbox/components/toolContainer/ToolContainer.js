import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import css from './toolContainer.css';

/**
 * @class
 * @author thiloSchlemmer
 */
export class ToolContainer extends BaElement {
	
	constructor() {
		super();

		const {		
			EnvironmentService: environmentService
		}
			= $injector.inject( 'EnvironmentService');

		this._environmentService = environmentService;
		this._portrait = false;
		this._minWidth = false;
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
			return this._portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return this._minWidth ?  'is-desktop'  : 'is-tablet';
		};

		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};


		return html`
			<style>${css}</style>		
			<div class="container ${getOrientationClass()} ${getMinWidthClass()}">  				
				<div class="content ${getOverlayClass()}">    		
					Content			               				               				 				           					 				               				               				 				            				               				               				 				           
				</div>		
			</div>		
		`;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	/**
	 * @override
	 * @param {Object} state 
	 */
	extractState(state) {
		const { toolContainer: { open } } = state;
		return { open };
	}

	static get tag() {
		return 'ba-tool-container';
	}

}