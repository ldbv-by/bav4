/**
 * @module modules/menu/components/navigationRail/NavigationRail
 */
import { html } from 'lit-html';
import css from './navigationRail.css';
import { $injector } from '../../../../injection';
import { TabIds } from '../../../../domain/mainMenu';
import { open, setTab } from '../../../../store/mainMenu/mainMenu.action';
import { MvuElement } from '../../../MvuElement';
import { Tools } from '../../../../domain/tools';
import { toggleSchema } from '../../../../store/media/media.action';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { increaseZoom, decreaseZoom } from '../../../../store/position/position.action';
import { fit } from '../../../../store/position/position.action';
import { closeNav } from '../../../../store/navigationRail/navigationRail.action';

const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_IsOpen_NavigationRail = 'update_isOpen_NavigationRail';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_Schema = 'update_schema';
const Update_FeatureInfo_Data = 'update_featureInfo_data';

/**
 *
 * @class
 * @author alsturm
 */
export class NavigationRail extends MvuElement {
	constructor() {
		super({
			isOpenNav: false,
			tabIndex: null,
			isPortrait: false,
			visitedTabIdsSet: null
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService,
			MapService: mapService
		} = $injector.inject('EnvironmentService', 'MapService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
		this._mapService = mapService;

		this._isOpen = false;
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
				this.signal(Update_IsOpen_NavigationRail, { isOpenNav: navigationRail.openNav, visitedTabIdsSet: navigationRail.visitedTabIdsSet })
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
		return this._environmentService.isEmbedded();
	}

	createView(model) {
		const { isOpenNav, darkSchema, isPortrait, tabIndex, isOpen, visitedTabIdsSet } = model;

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

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

		const getHideClass = () => {
			return isOpenNav ? '' : 'open-sub-nav';
		};
		const getIsActivelass = (tabId) => {
			return tabIndex === tabId && isOpen ? 'is-active' : '';
		};
		const getIsVisible = (tabId) => {
			console.log(visitedTabIdsSet);
			return visitedTabIdsSet.has(tabId) ? '' : 'hide';
		};

		const getDefaultMapExtent = () => this._mapService.getDefaultMapExtent();

		const zoomToExtent = () => {
			fit(getDefaultMapExtent(), { useVisibleViewport: false });
		};

		const translate = (key) => this._translationService.translate(key);
		return html`
			<style>
				${css}
			</style>
			<div class="preload">
				<div class="navigation-rail__container ${getHideClass()} ${getOrientationClass()} ">
					<button class=" ${getIsActivelass(TabIds.MAPS)}" @click="${() => openTab(TabIds.MAPS)}" style="order:0">
						<span class="icon home"> </span>
						<span class="text"> ${translate('menu_navigation_rail_home')} </span>
					</button>
					<span class="seperator"> </span>
					<button class=" ${getIsVisible(TabIds.ROUTING)} ${getIsActivelass(TabIds.ROUTING)}" @click="${() => openRoutingTab()}" style="order:1">
						<span class="icon routing"> </span>
						<span class="text"> ${translate('menu_navigation_rail_routing')} </span>
					</button>
					<button class="${getIsVisible(TabIds.FEATUREINFO)} ${getIsActivelass(TabIds.FEATUREINFO)}" @click="${() => openTab(TabIds.FEATUREINFO)}">				
						<span class="icon objektinfo"> </span>
						<span class="text"> ${translate('menu_navigation_rail_object_info')}  </span>
					</button>
					<button @click="${toggleSchema}" class="theme-toggle">
						<span class="icon ${getSchemaClass()}  "> </span>
					</button>
					<button <button class="touch ${getIsActivelass(TabIds.SEARCH)}" @click="${() => openTab(TabIds.SEARCH)}">
						<span class="icon search-icon "> </span>
						<span class="text"> ${translate('menu_navigation_rail_search')}  </span>
					</button>
					<button @click="${increaseZoom}" class="touch">
						<span class="icon zoom-in "> </span>
						<span class="text"> ${translate('menu_navigation_rail_zoom_out')}   </span>
					</button>
					<button @click="${decreaseZoom}" class="touch">
						<span class="icon zoom-out  "> </span>
						<span class="text"> ${translate('menu_navigation_rail_zoom_in')}  </span>
					</button>
					<button @click="${zoomToExtent}" class="touch">
						<span class="icon zoom-to-extent-icon "> </span>
						<span class="text"> ${translate('menu_navigation_rail_zoom_to_extend')} </span>
					</button>
					<button @click="${closeNav}" class="touch">
						<span class="icon close-icon "> </span>
						<span class="text"> ${translate('menu_navigation_rail_close')} </span>
					</button>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-navigation-rail';
	}
}
