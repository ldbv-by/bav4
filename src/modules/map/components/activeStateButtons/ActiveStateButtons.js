/**
 * @module modules/map/components/activeStateButtons/ActiveStateButtons
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './activeStateButtons.css';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { Tools } from '../../../../domain/tools';
import closeSvg from './assets/close.svg';

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_ToolId = 'update_tooId';
const Update_FeatureInfo_Data = 'update_featureInfo_data';
const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';

/**
 * Container for active state buttons
 *
 * @class
 * @author alsturm
 */

export class ActiveStateButtons extends MvuElement {
	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			toolId: null
		});

		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'GeoResourceService', 'EnvironmentService');

		this._translationService = TranslationService;
		this._environmentService = EnvironmentService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_ToolId:
				return { ...model, toolId: data };
			case Update_FeatureInfo_Data:
				return { ...model, featureInfoData: [...data] };
			case Update_IsOpen_TabIndex:
				return { ...model, ...data };
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
					@click=${setCurrentTool}
				></ba-button>
			</div>
		`;
	}

	static get tag() {
		return 'active-state-buttons';
	}
}
