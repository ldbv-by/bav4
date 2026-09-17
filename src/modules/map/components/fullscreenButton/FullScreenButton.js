/**
 * @module modules/map/components/zoomButtons/ZoomToExtentButton
 */
import { html } from 'lit-html';
import css from './fullScreenButton.css?inline';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { toggleFullscreen } from '../../../../store/media/media.action';

const Update_Fullscreen = 'update_fullscreen';

/**
 * Button that causes the map to zoom to a given extent
 * @class
 * @author alsturm
 */
export class FullScreenButton extends MvuElement {
	#translationService;

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this.#translationService = TranslationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Fullscreen:
				return { ...model, fullscreen: data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media.fullscreen,
			(fullscreen) => this.signal(Update_Fullscreen, fullscreen)
		);
	}

	/**
	 *@override
	 */
	createView(model) {
		const { fullscreen } = model;
		const translate = (key) => this.#translationService.translate(key);

		const getIsActiveFullscreen = () => {
			return fullscreen ? 'is-active-fullscreen' : '';
		};

		return html`
			<style>
				${css}
			</style>
			<div class="fullscreen">
				<button @click=${toggleFullscreen} class="fullscreen-button ${getIsActiveFullscreen()}" title=${translate('TODO')}>
					<i class="icon fullscreen-icon"></i>
				</button>
			</div>
		`;
	}

	static get tag() {
		return 'ba-fullscreen-button';
	}
}
