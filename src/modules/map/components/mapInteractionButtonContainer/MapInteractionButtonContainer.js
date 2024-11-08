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
 * Container for map interaction button
 *
 * @class
 * @author alsturm
 */

export class MapInteractionButtonContainer extends MvuElement {
	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			toolId: null
		});

		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'EnvironmentService');

		this._translationService = TranslationService;
		this._environmentService = EnvironmentService;
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
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
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
		const translate = (key) => this._translationService.translate(key);
		const { isPortrait, hasMinWidth, toolId } = model;

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const getShowRoutingClass = (toolId) => {
			return Tools.ROUTING === toolId ? '' : 'hide';
		};

		return html`
			<style>
				${css}
			</style>
			<div class="active-state-buttons-container ${getOrientationClass()} ${getMinWidthClass()}">
				<ba-button
					class="${getShowRoutingClass(toolId)}"
					.icon=${closeSvg}
					.label=${translate('active_state_buttons_stop_routing')}
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
