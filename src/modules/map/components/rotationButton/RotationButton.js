import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './rotationButton.css';
import { $injector } from '../../../../injection';
import { changeRotation } from '../../../../store/position/position.action';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';

/**
 * Button that indicates a rotaion of the map and reset it on press.
 * @class
 * @author taulinger
 */
export class RotationButton extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	 * @override
	 */
	createView(state) {
		const { liveRotation } = state;
		const translate = (key) => this._translationService.translate(key);

		const onClick = () => {
			changeRotation(0);
		};

		const classes = {
			hidden: liveRotation === 0
		};

		const styles = {
			transform: `rotate(${liveRotation}rad)`
		};

		return html`
			<style>${css}</style>
			<div class="rotation">
				<button class="rotation-button ${classMap(classes)}" style="${styleMap(styles)}" @click=${onClick} title=${translate('map_rotationButton_title')} >
					<i class="icon rotation-icon"></i>
				</button>
			</div>
		`;
	}

	extractState(globalState) {
		const { position: { liveRotation } } = globalState;
		return { liveRotation };
	}

	static get tag() {
		return 'ba-rotation-button';
	}
}