/**
 * @module modules/menu/components/navigationRail/NavigationRail
 */
import { html } from 'lit-html';
import css from './navigationRail.css';
import { MvuElement } from '../../../MvuElement';
import { $injector } from '../../../../injection';
import { TabIds } from '../../../../domain/mainMenu';
import { open, setTab } from '../../../../store/mainMenu/mainMenu.action';
import { Tools } from '../../../../domain/tools';
import { toggleSchema } from '../../../../store/media/media.action';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { increaseZoom, decreaseZoom } from '../../../../store/position/position.action';
import { fit } from '../../../../store/position/position.action';
import { close } from '../../../../store/navigationRail/navigationRail.action';
import { classMap } from 'lit-html/directives/class-map.js';

const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_IsOpen_NavigationRail = 'update_NavigationRail';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_Schema = 'update_schema';
const Update_FeatureInfo_Data = 'update_featureInfo_data';

/**
 * Side navigation component in large window sizes and a map navigation component in compact window sizes.
 * @class
 * @author alsturm
 */
export class NavigationRail extends MvuElement {
	#environmentService;
	#translationService;
	#mapService;

	constructor() {
		super({
			open: false,
			isOpenNavigationRail: false,
			tabIndex: null,
			isPortrait: false,
			visitedTabIds: null
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService,
			MapService: mapService
		} = $injector.inject('EnvironmentService', 'MapService', 'TranslationService');

		this.#environmentService = environmentService;
		this.#translationService = translationService;
		this.#mapService = mapService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsOpen_TabIndex:
				return { ...model, ...data };
			case Update_IsOpen_NavigationRail:
				return { ...model, ...data };
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_Schema:
				return { ...model, darkSchema: data };
			case Update_FeatureInfo_Data:
				return { ...model, featureInfoData: [...data] };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.mainMenu,
			(mainMenu) => this.signal(Update_IsOpen_TabIndex, { isOpen: mainMenu.open, tabIndex: mainMenu.tab })
		);
		this.observe(
			(state) => state.navigationRail,
			(navigationRail) =>
				this.signal(Update_IsOpen_NavigationRail, { isOpenNavigationRail: navigationRail.open, visitedTabIds: navigationRail.visitedTabIds })
		);
		this.observe(
			(state) => state.media.darkSchema,
			(darkSchema) => this.signal(Update_Schema, darkSchema)
		);
		this.observe(
			(store) => store.featureInfo.current,
			(current) => this.signal(Update_FeatureInfo_Data, [...current])
		);
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
	}

	isRenderingSkipped() {
		return this.#environmentService.isEmbedded();
	}

	createView(model) {
		const { isOpenNavigationRail, darkSchema, isPortrait, tabIndex, isOpen, visitedTabIds } = model;

		const reverseTabIds = [...visitedTabIds].reverse();

		const getSchemaClass = () => {
			return darkSchema ? 'sun' : 'moon';
		};

		const openTab = (tabId) => {
			setTab(tabId);
			open();
		};

		const openRoutingTab = () => {
			setTab(TabIds.ROUTING);
			setCurrentTool(Tools.ROUTING);
			open();
		};

		const getIsActive = (tabId) => {
			return tabIndex === tabId && isOpen ? 'is-active' : '';
		};

		const getIsVisible = (tabId) => {
			return visitedTabIds.includes(tabId) ? '' : 'hide';
		};

		const getDefaultMapExtent = () => this.#mapService.getDefaultMapExtent();

		const zoomToExtent = () => {
			fit(getDefaultMapExtent(), { useVisibleViewport: false });
		};

		const getFlexOrder = (tabId) => {
			//first tow are always home-button and separator
			return reverseTabIds.indexOf(tabId) + 2;
		};

		const classes = {
			'is-open': isOpenNavigationRail,
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		const translate = (key) => this.#translationService.translate(key);
		return html`
			<style>
				${css}
			</style>
			<div class="${classMap(classes)}">
				<div class="navigation-rail__container">
					<button class="home ${getIsActive(TabIds.MAPS)}" @click="${() => openTab(TabIds.MAPS)}">
						<span class="icon "> </span>
						<span class="text"> ${translate('menu_navigation_rail_home')} </span>
					</button>
					<span class="separator landscape"> </span>
					<button
						class="routing ${getIsVisible(TabIds.ROUTING)} ${getIsActive(TabIds.ROUTING)}"
						@click="${() => openRoutingTab()}"
						style="order:${getFlexOrder(TabIds.ROUTING)}"
					>
						<span class="icon"></span>
						<span class="text">${translate('menu_navigation_rail_routing')}</span>
					</button>
					<button
						class=" objectinfo ${getIsVisible(TabIds.FEATUREINFO)} ${getIsActive(TabIds.FEATUREINFO)}"
						@click="${() => openTab(TabIds.FEATUREINFO)}"
						style="order:${getFlexOrder(TabIds.FEATUREINFO)}"
					>
						<span class="icon "> </span>
						<span class="text">${translate('menu_navigation_rail_object_info')}</span>
					</button>
					<button @click="${increaseZoom}" class="zoom-in">
						<span class="icon  "> </span>
						<span class="text">${translate('menu_navigation_rail_zoom_in')}</span>
					</button>
					<button @click="${decreaseZoom}" class="zoom-out">
						<span class="icon   "> </span>
						<span class="text">${translate('menu_navigation_rail_zoom_out')}</span>
					</button>
					<button @click="${zoomToExtent}" class="zoom-to-extent">
						<span class="icon  "> </span>
						<span class="text">${translate('menu_navigation_rail_zoom_to_extend')}</span>
					</button>
					<button @click="${close}" class="close">
						<span class="icon "> </span>
						<span class="text">${translate('menu_navigation_rail_close')}</span>
					</button>

					<button @click="${toggleSchema}" class=" ${getSchemaClass()} theme-toggle pointer">
						<span class="icon "> </span>
					</button>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-navigation-rail';
	}
}
