/**
 * @module modules/map/components/zoomButtons/ZoomToExtentButton
 */
import { html } from 'lit-html';
import css from './zoomToExtentButton.css';
import { $injector } from '../../../../injection';
import { fit } from '../../../../store/position/position.action';
import { MvuElement } from '../../../MvuElement';

/**
 * Button that causes the map to zoom to a given extent
 * @class
 * @author bakir_en
 */

export class ZoomToExtentButton extends MvuElement {
	#translationService;
	#mapService;

	constructor() {
		super();
		const { TranslationService, MapService } = $injector.inject('TranslationService', 'MapService');
		this.#translationService = TranslationService;
		this.#mapService = MapService;
	}

	/**
	 *@override
	 */
	createView() {
		const translate = (key) => this.#translationService.translate(key);
		const getDefaultMapExtent = () => this.#mapService.getDefaultMapExtent();

		const zoomToExtent = () => {
			fit(getDefaultMapExtent(), { useVisibleViewport: false });
		};

		return html`
			<style>
				${css}
			</style>
			<div class="zoom-to-extent">
				<button class="zoom-to-extent-button" @click=${zoomToExtent} title="${translate('map_zoomButtons_extent')}">
					<i class="icon zoom-to-extent-icon"></i>
				</button>
			</div>
		`;
	}

	static get tag() {
		return 'ba-extent-button';
	}
}
