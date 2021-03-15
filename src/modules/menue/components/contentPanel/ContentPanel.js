import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './contentPanel.css';
import { closeContentPanel } from '../../store/contentPanel.action';
import { $injector } from '../../../../injection';

/**
 *  
 * @class
 * @author alsturm
 */
export class ContentPanel extends BaElement {

	constructor() {
		super();
		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
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

	/**
	 * @override
	 */
	createView() {

		const { open } = this._state;

		const getOrientationClass = () => {
			return this._portrait ? 'portrait' : 'landscape';
		};

		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};

		return html`
			<style>${css}</style>
			<div class="${getOrientationClass()}">
				<div class="content-panel ${getOverlayClass()}">            
					<button @click="${closeContentPanel}" class="content-panel__close-button">
						<span class='arrow'></span>	
					</button>
				</div>			
			</div>			
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
