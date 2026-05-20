/**
 * @module modules/map/components/layerSwipeSlider/LayerSwipeSlider
 */
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../../injection';
import css from './layerSwipeModal.css?inline';
import { MvuElement } from '../../../MvuElement';
import { closeModal } from '../../../../store/modal/modal.action';

/**
 *
 * @class
 * @author alsturm
 */

export class LayerSwipeModal extends MvuElement {
	#topicsService;
	#translationService;

	constructor() {
		super();
		const { TopicsService: topicsService, TranslationService: translationService } = $injector.inject(
			'StoreService',
			'TopicsService',
			'TranslationService'
		);

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
				<div class="image"></div>
				<div>
					<p class="modal-text">${unsafeHTML(translate('map_layerSwipeSlider_modal'))}</p>
					<a href="${translate('map_layerSwipeSlider_modal_link_url')}" target="_blank" rel="noopener noreferrer">
						${translate('map_layerSwipeSlider_modal_link_text')}
					</a>

					<div class="image-container">
						<ba-base-layer-switcher
							exportparts="container:base-layer-switcher-container,badge:base-layer-switcher-badge,group:base-layer-switcher-group,item:base-layer-switcher-item,button:base-layer-switcher-button,label:base-layer-switcher-label"
							.configuration=${{ all: allBaseGeoResourceIds, managed: allBaseGeoResourceIds }}
							@click=${() => closeModal()}
						></ba-base-layer-switcher>
					</div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-layer-swipe-modal';
	}
}
