import { html, nothing } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './rotationButton.css';
import { $injector } from '../../../../injection';
import { changeRotation } from '../../../../store/position/position.action';
import { styleMap } from 'lit-html/directives/style-map.js';

/**
 * Button that indicates a rotation of the map and resets it on press.
 * @class
 * @author taulinger
 */
export class RotationButton extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._timeoutId = null;
	}

	/**
	 * @override
	 */
	initialize() {
		/**
		 * When a user rotates the map, the icon button will be hidden when the maps rotation angle is below a threshold and
		 * it will be shown again above this value.
		 * In order to avoid a flickering icon, we delay hiding the icon.
		 */
		this.observe('liveRotation', liveRotation => {
			if (Math.abs(liveRotation) >= RotationButton.ROTATION_THRESHOLD) {
				if (this._timeoutId) {
					clearTimeout(this._timeoutId);
					this._timeoutId = null;
				}
				this.render();
			}
			else {
				if (!this._timeoutId) {
					this._timeoutId = setTimeout(() => {
						this.render();
					}, RotationButton.HIDE_BUTTON_DELAY_MS);
				}
			}
		}, true);
	}

	/**
	 * @override
	 */
	createView(state) {
		const { liveRotation } = state;
		const translate = (key) => this._translationService.translate(key);

		if (!this._timeoutId) {

			const onClick = () => {
				changeRotation(0);
			};

			const styles = {
				transform: `rotate(${liveRotation}rad)`
			};

			return html`
			<style>${css}</style>
			<div>
				<button class="rotation-button" style="${styleMap(styles)}" @click=${onClick} title=${translate('map_rotationButton_title')} >
					<i class="icon rotation-icon"></i>
				</button>
			</div>
			`;
		}
		return nothing;
	}

	onStateChanged() {
		//nothing to do here
	}

	extractState(globalState) {
		const { position: { liveRotation } } = globalState;
		return { liveRotation };
	}

	static get tag() {
		return 'ba-rotation-button';
	}

	static get ROTATION_THRESHOLD() {
		return .05;
	}

	static get HIDE_BUTTON_DELAY_MS() {
		return 1000;
	}
}