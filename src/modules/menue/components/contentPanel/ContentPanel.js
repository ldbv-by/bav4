import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import cssmain from '../../../../main.css';
import css from './contentPanel.css';
import { closeSidePanel } from '../../store/sidePanel.action';
import { $injector } from '../../../../injection';
// import { fit } from '../../store/position.action';


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

	}

	/**
	 * @override
	 */
	createView() {

		const { open } = this._state;

		const getOverlayClass = () => {			
			return open ? 'is-open' : '';			
		};
		
		return html`
			<style>${cssmain}</style>
			<style>${css}</style>
			<div class="content-panel ${getOverlayClass()}">            
			<button @click="${closeSidePanel}" class="content-panel__close-button">
				<span class='arrow'></span>	
			</button>
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
		const { sidePanel: { open } } = store;
		return { open };
	}

	static get tag() {
		return 'ba-content-panel';
	}
}
