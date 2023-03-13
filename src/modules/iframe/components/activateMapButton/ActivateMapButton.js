import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './activateMapButton.css';
// import commonActivateMapCss from './activateMapCommonStyles.css';
import { $injector } from '../../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';

/**
 * @class
 * @author alsturm
 */
export class ActivateMapButton extends MvuElement {
	constructor() {
		super();

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	onWindowLoad() {
		//append common styles
		const renderCommonStyle = () => {
			return `
			body *:not(
				ba-activate-map-button,
				ba-ol-map,
				ba-footer
				 ) {
				display: none;
			}	
			ba-footer{
				position:absolute;
				z-index: calc(var(--z-disableall) + 1 );
			}		
			`;
		};

		if (!document.getElementById(ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id)) {
			const style = document.createElement('style');
			style.innerHTML = renderCommonStyle();
			style.id = ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id;
			document.head.appendChild(style);
		}
	}

	createView() {
		const close = () => {
			const commonStyle = document.getElementById(ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id);
			commonStyle.remove();
			const background = this.shadowRoot.getElementById('background');
			background.classList.add('hide');
		};

		const isTouch = {
			istouch: this._environmentService.isTouch()
		};

		return html`
			<style>
				${css}
			</style>
			<div id="background" class="active-map__background">
				<div class="active-map__button ${classMap(isTouch)}"">
					<ba-button .type=${'primary'} .label=${'Karte Aktivieren'} @click=${close}></ba-button>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-activate-map-button';
	}

	static get ACTIVATE_MAP_COMMON_Style_Id() {
		return 'activate_map_commons_kkfjrutmfjhwwww';
	}
}
