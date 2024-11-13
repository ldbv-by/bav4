/**
 * @module modules/map/components/mapInteractionButtonContainer/MapInteractionButtonContainer
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './mapInteractionButtonContainer.css';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { Tools } from '../../../../domain/tools';
import closeSvg from './assets/close.svg';

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_ToolId = 'update_tooId';

/**
 * Container for map interaction buttons.
 *
 * @class
 * @author alsturm
 */

export class MapInteractionButtonContainer extends MvuElement {
	#translationService;
	constructor() {
		super({
			isPortrait: false,
			toolId: null
		});

		const { TranslationService } = $injector.inject('TranslationService');

		this.#translationService = TranslationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_ToolId:
				return { ...model, toolId: data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait })
		);
		this.observe(
			(state) => state.tools.current,
			(current) => this.signal(Update_ToolId, current)
		);
	}

	/**
	 *@override
	 */
	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { isPortrait, toolId } = model;

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getShowRoutingClass = () => {
			return Tools.ROUTING === toolId ? '' : 'hide';
		};

		return html`
			<style>
				${css}
			</style>
			<div class="map-interaction-button-container ${getOrientationClass()}">
				<ba-button
					class="${getShowRoutingClass()} routing"
					.icon=${closeSvg}
					.label=${translate('map_interaction_button_container')}
					.type=${'primary'}
					@click=${() => setCurrentTool(null)}
				></ba-button>
			</div>
		`;
	}

	static get tag() {
		return 'ba-map-interaction-button-container';
	}
}
