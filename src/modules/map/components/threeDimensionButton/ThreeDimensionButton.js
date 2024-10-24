/**
 * @module modules/map/components/threeDimensionButton/ThreeDimensionButton
 */
import { html } from 'lit-html';

import { $injector } from '../../../../injection';
import css from './threeDimensionButton.css';
import { MvuElement } from '../../../MvuElement';

/**
 * Button that opens 3D page
 * @class
 * @author alsturm
 */

export class ThreeDimensionButton extends MvuElement {
	constructor() {
		super();

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>
				${css}
			</style>
			<div>
				<a href="https://atlas.bayern.de/?" target="_blank" class="three-dimension-button" title=${translate('map_threeDimensionButton_title')}>
					<i class="icon three-dimension-icon"></i>
				</a>
			</div>
		`;
	}
	static get tag() {
		return 'ba-three-dimension-button';
	}
}
