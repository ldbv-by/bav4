/**
 * @module modules/map/components/layerSwipeSlider/LayerSwipeSlider
 */
import { html } from 'lit-html';

import { $injector } from '../../../../injection';
import css from './layerSwipeSlider.css';
import { MvuElement } from '../../../MvuElement';
import { updateRatio } from '../../../../store/layerSwipe/layerSwipe.action';
import { nothing } from '../../../../../node_modules/ol/pixel';

const Update_Layer_Swipe = 'update_layer_swipe';

/**
 * Component to swipe map layers
 * @class
 * @author alsturm
 */

export class LayerSwipeSlider extends MvuElement {
	constructor() {
		super({ active: false, ratio: null });
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Layer_Swipe:
				return { ...model, ...data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.layerSwipe,
			(layerSwipe) => this.signal(Update_Layer_Swipe, { active: layerSwipe.active, ratio: layerSwipe.ratio })
		);
	}

	createView(model) {
		const { active, ratio } = model;
		const translate = (key) => this._translationService.translate(key);

		const onChangeSlider = (event) => {
			const line = this.shadowRoot.getElementById('line');
			line.style.left = parseInt(event.target.value) + '%';

			updateRatio(parseInt(event.target.value));
		};

		return active
			? html`
					<style>
						${css}
					</style>
					<div id="line" class="line" style="left:${ratio}%"></div>
					<div class="layer-swipe">
						<input
							id="rangeslider"
							type="range"
							min="0"
							max="100"
							step="1"
							title="${translate('map_layerSwipeSlider')}"
							value="${ratio}"
							@input=${onChangeSlider}
						/>
					</div>
				`
			: nothing;
	}
	static get tag() {
		return 'ba-layer-swipe';
	}
}
