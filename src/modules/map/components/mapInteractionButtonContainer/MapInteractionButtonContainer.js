/**
 * @module modules/map/components/mapInteractionButtonContainer/MapInteractionButtonContainer
 */
import { html } from 'lit-html';
import { Tools } from '../../../../domain/tools';
import { $injector } from '../../../../injection';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { findAllBySelector } from '../../../../utils/markup';
import { MvuElement } from '../../../MvuElement';
import closeSvg from './assets/close.svg';
import css from './mapInteractionButtonContainer.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { BottomSheet } from '../../../stackables/components/bottomSheet/BottomSheet';

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_ToolId = 'update_tooId';
const Update_Bottom_Sheet = 'update_bottom_sheet';
const Update_Main_Menu = 'update_main_menu';
const Update_IsOpen_NavigationRail = 'update_isOpen_NavigationRail';

/**
 * Container for map interaction buttons.
 *
 * @class
 * @author alsturm
 */

export class MapInteractionButtonContainer extends MvuElement {
	#translationService;
	#environmentService;
	constructor() {
		super({
			toolId: null,
			isOpenMainMenu: false,
			isPortrait: false,
			isOpenNavigationRail: false
		});

		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'EnvironmentService');

		this.#translationService = TranslationService;
		this.#environmentService = EnvironmentService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_ToolId:
				return { ...model, toolId: data };
			case Update_Bottom_Sheet:
				return { ...model, active: data };
			case Update_Main_Menu:
				return { ...model, ...data };
			case Update_IsOpen_NavigationRail:
				return { ...model, ...data };
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
		this.observe(
			(state) => state.bottomSheet.active,
			(active) => this.signal(Update_Bottom_Sheet, active)
		);
		this.observe(
			(state) => state.mainMenu,
			(mainMenu) => this.signal(Update_Main_Menu, { isOpenMainMenu: mainMenu.open, tab: mainMenu.tab })
		);
		this.observe(
			(state) => state.navigationRail,
			(navigationRail) => this.signal(Update_IsOpen_NavigationRail, { isOpenNavigationRail: navigationRail.open })
		);
	}

	/**
	 * @override
	 */
	onAfterRender() {
		setTimeout(() => {
			const mapInteractionButtonContainer = this.shadowRoot.getElementById('mapInteractionButtonContainer');
			const bottomSheet = findAllBySelector(this.#environmentService.getWindow().document, BottomSheet.tag);
			bottomSheet[0]
				? (mapInteractionButtonContainer.style.bottom = bottomSheet[0].offsetHeight + 10 + 'px')
				: (mapInteractionButtonContainer.style.bottom = 'var(--map-interaction-container-bottom)');
		});
	}

	/**
	 *@override
	 */
	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { toolId, isOpenMainMenu, isOpenNavigationRail, isPortrait } = model;

		const classes = {
			'is-open': isOpenMainMenu,
			'is-open-navigationRail': isOpenNavigationRail,
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		const getShowRoutingClass = () => {
			return Tools.ROUTING === toolId ? '' : 'hide';
		};
		const getShowLayerSwipeClass = () => {
			return Tools.COMPARE === toolId ? '' : 'hide';
		};

		return html`
			<style>
				${css}
			</style>
			<div id="mapInteractionButtonContainer" class="map-interaction-button-container ${classMap(classes)}">
				<ba-button
					class="${getShowRoutingClass()} routing ui-center"
					.icon=${closeSvg}
					.label=${translate('map_interaction_button_container_routing')}
					.type=${'primary'}
					@click=${() => setCurrentTool(null)}
				></ba-button>
				<ba-button
					class="${getShowLayerSwipeClass()} layer-swipe"
					.icon=${closeSvg}
					.label=${translate('map_interaction_button_container_layerSwipe')}
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
