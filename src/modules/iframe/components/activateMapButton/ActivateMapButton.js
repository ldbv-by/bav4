import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './activateMapButton.css';
import commonActivateMapCss from './activateMapCommonStyles.css';

/**
 * @class
 * @author alsturm
 */
export class ActivateMapButton extends MvuElement {
	constructor() {
		super();
		this._isVisible = false;
	}

	onWindowLoad() {
		//append common styles
		if (!document.getElementById(ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id)) {
			const style = document.createElement('style');
			style.innerHTML = commonActivateMapCss;
			style.id = ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id;
			document.head.appendChild(style);
		}
	}

	createView() {
		const close = () => {
			this._isVisible = true;
			const commonStyle = document.getElementById(ActivateMapButton.ACTIVATE_MAP_COMMON_Style_Id);
			commonStyle.remove();
			const background = this.shadowRoot.getElementById('background');
			background.classList.add('hide');
		};

		return html`
			<style>
				${css}
			</style>
			<div id="background" class="active-map__background">
				<div class="active-map__button">
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
