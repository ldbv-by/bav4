import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import cssmain from '../../../../main.css';
import css from './mediaQueryPanel.css';
import { closeSidePanel } from '../../store/sidePanel.action';


/**
 *  Example for using and testing media queries
 * @class
 */
export class MediaQueryPanel extends BaElement {

	constructor() {
		super();
		this._portrait = false;
		this._minWidth = false;
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

		
		//MediaQuery for 'min-width'
		const mediaQueryMinWidth = window.matchMedia('(min-width: 600px)');
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
			return this._minWidth ? 'only-greater-600' : '';
		};

		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};

		return html`
			<style>${cssmain}</style>
			<style>${css}</style>
			<div class="${getOrientationClass()}">
				<div class="content-panel ${getOverlayClass()} ${getMinWidthClass()}">            
					<button @click="${closeSidePanel}" class="content-panel__close-button">
						<span class='arrow'></span>	
					</button>
				</div>			
			</div>			
		`;
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
		return 'ba-media-query-panel';
	}
}
