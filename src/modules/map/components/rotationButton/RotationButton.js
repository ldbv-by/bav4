import { html, nothing } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './rotationButton.css';
import { $injector } from '../../../../injection';
import { changeRotation } from '../../../../store/position/position.action';
import { styleMap } from 'lit-html/directives/style-map.js';
import { throttled } from '../../../../utils/timer';


const Update_Live_Rotation = 'update_live_rotation';

/**
 * Button that indicates a rotation of the map and resets it on press.
 * @class
 * @author taulinger
 */
export class RotationButton extends MvuElement {

	constructor() {
		super({ liveRotation: 0 });

		const { MapService: mapService, TranslationService: translationService } = $injector.inject('MapService', 'TranslationService');
		this._mapService = mapService;
		this._translationService = translationService;
		this._timeoutId = null;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Live_Rotation:
				return { ...model, liveRotation: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {

		/**
		 * liveRotation value changes on a high frequency, therefore we throttle the view's update down to avoid a flickering icon
		 */
		const update = throttled(RotationButton.THROTTLE_DELAY_MS, liveRotation => this.signal(Update_Live_Rotation, liveRotation));
		/**
		 * When a user rotates the map, the icon button will be hidden when the maps rotation angle is below a threshold and
		 * it will be shown again above this value.
		 * In order to avoid a flickering icon, we delay hiding the icon.
		 */
		this.observe(store => store.position.liveRotation, liveRotation => {
			if (Math.abs(liveRotation) >= this._mapService.getMinimalRotation()) {
				if (this._timeoutId) {
					clearTimeout(this._timeoutId);
					this._timeoutId = null;
				}
			}
			else {
				if (!this._timeoutId) {
					this._timeoutId = setTimeout(() => {
						update(liveRotation);
					}, RotationButton.HIDE_BUTTON_DELAY_MS);
				}
			}
			update(liveRotation);
		}, true);
	}

	/**
	 * @override
	 */
	createView(model) {
		const { liveRotation } = model;
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

	static get tag() {
		return 'ba-rotation-button';
	}

	static get HIDE_BUTTON_DELAY_MS() {
		return 1000;
	}

	static get THROTTLE_DELAY_MS() {
		return 100;
	}
}
