/**
 * @module modules/map/components/layerSwipeSlider/LayerSwipeModal
 */
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../../injection';
import { closeModal } from '../../../../store/modal/modal.action';
import { MvuElement } from '../../../MvuElement';
import css from './layerSwipeModal.css?inline';

/**
 * @author alsturm
 */

export class LayerSwipeModal extends MvuElement {
	#topicsService;
	#translationService;

	constructor() {
		super();
		const { TopicsService: topicsService, TranslationService: translationService } = $injector.inject('TopicsService', 'TranslationService');

		this.#topicsService = topicsService;
		this.#translationService = translationService;
	}

	createView() {
		const translate = (key) => this.#translationService.translate(key);
		const allBaseGeoResourceIds = Array.from(new Set(Object.values(this.#topicsService.default().baseGeoRs).flat()));
		return html`
			<style>
				${css}
			</style>
			<div class="modal">
				<p class="modal-text">
					${translate('map_layerSwipeSlider_modal')}
					<a href="${translate('map_layerSwipeSlider_modal_link_url')}" target="_blank" class="modal-link" rel="noopener noreferrer">
						${translate('map_layerSwipeSlider_modal_link_text')}
					</a>
				</p>
				<ba-base-layer-switcher
					.configuration=${{ all: allBaseGeoResourceIds, managed: allBaseGeoResourceIds }}
					@click=${() => closeModal()}
				></ba-base-layer-switcher>
			</div>
		`;
	}

	static get tag() {
		return 'ba-layer-swipe-modal';
	}
}
