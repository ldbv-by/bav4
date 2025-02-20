/**
 * @module modules/menu/components/navigationRail/NavigationRail
 */
import { html } from 'lit-html';
import css from './navigationRail.css';
import { MvuElement } from '../../../MvuElement';
import { $injector } from '../../../../injection';
import { TabIds } from '../../../../domain/mainMenu';
import { open, toggle, setTab } from '../../../../store/mainMenu/mainMenu.action';
import { Tools } from '../../../../domain/tools';
import { toggleSchema } from '../../../../store/media/media.action';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { increaseZoom, decreaseZoom } from '../../../../store/position/position.action';
import { fit } from '../../../../store/position/position.action';
import { close } from '../../../../store/navigationRail/navigationRail.action';
import { classMap } from 'lit-html/directives/class-map.js';
import { closeModal, openModal } from '../../../../store/modal/modal.action';
import { PredefinedConfiguration } from '../../../../services/PredefinedConfigurationService';
import { activateLegend, deactivateLegend } from '../../../../store/legend/legend.action';

const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_IsOpen_NavigationRail = 'update_NavigationRail';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_Schema = 'update_schema';
const Update_Auth = 'update_auth';

/**
 * Side navigation component in large window sizes and a map navigation component in compact window sizes.
 * @class
 * @author alsturm
 */
export class NavigationRail extends MvuElement {
	#environmentService;
	#translationService;
	#mapService;
	#authService;
	#predefinedConfigurationService;
	#storeService;

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
			MapService: mapService,
			AuthService: authService,
			PredefinedConfigurationService: predefinedConfigurationService,
			StoreService: storeService
		} = $injector.inject('EnvironmentService', 'MapService', 'TranslationService', 'AuthService', 'PredefinedConfigurationService', 'StoreService');

		this.#environmentService = environmentService;
		this.#translationService = translationService;
		this.#mapService = mapService;
		this.#authService = authService;
		this.#predefinedConfigurationService = predefinedConfigurationService;
		this.#storeService = storeService;
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
			case Update_Auth:
				return { ...model, signedIn: data };
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
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
		this.observe(
			(state) => state.auth.signedIn,
			(signedIn) => this.signal(Update_Auth, signedIn)
		);
	}

	isRenderingSkipped() {
		return this.#environmentService.isEmbedded();
	}

	createView(model) {
		const { isOpenNavigationRail, darkSchema, isPortrait, tabIndex, isOpen, visitedTabIds, signedIn } = model;

		const reverseTabIds = [...visitedTabIds].reverse();

		const openFeedbackDialog = () => {
			const title = translate('menu_navigation_rail_feedback');
			const content = html`<ba-mvu-togglefeedbackpanel .onSubmit=${closeModal}></ba-mvu-togglefeedbackpanel>`;
			openModal(title, content, { steps: 2 });
		};

		const onClickSignIn = async () => {
			this.#authService.signIn();
		};

		const onClickSignOut = () => {
			this.#authService.signOut();
		};

		const getSchemaClass = () => {
			return darkSchema ? 'sun' : 'moon';
		};

		const getTooltip = () => {
			return darkSchema ? 'menu_navigation_rail_light_theme' : 'menu_navigation_rail_dark_theme';
		};

		const getIsActive = (tabId) => {
			return tabIndex === tabId && (isOpen || isPortrait) ? 'is-active' : '';
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
					<button
						title="${translate('menu_navigation_rail_home_tooltip')}"
						class="home ${getIsActive(TabIds.MAPS)}"
						@click="${() => this._openTab(TabIds.MAPS)}"
					>
						<span class="icon "> </span>
						<span class="text"> ${translate('menu_navigation_rail_home')} </span>
					</button>
					<span class="separator landscape"> </span>
					<button
						title="${translate('menu_navigation_rail_routing_tooltip')}"
						class="routing ${getIsVisible(TabIds.ROUTING)} ${getIsActive(TabIds.ROUTING)}"
						@click="${() => this._openTab(TabIds.ROUTING)}"
						style="order:${getFlexOrder(TabIds.ROUTING)}"
					>
						<span class="icon"></span>
						<span class="text">${translate('menu_navigation_rail_routing')}</span>
					</button>
					<button
						title="${translate('menu_navigation_rail_object_info_tooltip')}"
						class=" objectinfo ${getIsVisible(TabIds.FEATUREINFO)} ${getIsActive(TabIds.FEATUREINFO)}"
						@click="${() => this._openTab(TabIds.FEATUREINFO)}"
						style="order:${getFlexOrder(TabIds.FEATUREINFO)}"
					>
						<span class="icon "> </span>
						<span class="text">${translate('menu_navigation_rail_object_info')}</span>
					</button>
					<button
						title="${translate('menu_navigation_rail_time_travel_tooltip')}"
						class="timeTravel"
						@click="${() => this._showTimeTravel()}"
						style="order: ${reverseTabIds.length + 1}"
					>
						<span class="icon "> </span>
						<span class="text">${translate('menu_navigation_rail_time_travel')}</span>
					</button>
					<button
						title="${translate('menu_navigation_rail_legend_tooltip')}"
						class="legend"
						@click="${() => this._showLegend()}"
						style="order: ${reverseTabIds.length + 2}"
					>
						<span class="icon "> </span>
						<span class="text">${translate('menu_navigation_rail_legend')}</span>
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
					<div class="sub-button-container">
						<button
							id="authButton"
							@click=${signedIn ? onClickSignOut : onClickSignIn}
							title="${translate(signedIn ? 'menu_navigation_rail_logout' : 'menu_navigation_rail_login')}"
							class="log-in pointer ${signedIn ? 'logout' : ''}"
						>
							<span class="icon "> </span>
						</button>
						<button id="feedback" @click="${openFeedbackDialog}" title="${translate('menu_navigation_rail_feedback')}" class="feedback pointer">
							<span class="icon "> </span>
						</button>
						<a
							id="help"
							href="${translate('menu_navigation_rail_help_url')}"
							target="_blank"
							title="${translate('menu_navigation_rail_help')}"
							class="help pointer"
						>
							<span class="icon "> </span>
						</a>
						<button @click="${toggleSchema}" title="${translate(getTooltip())}" class=" ${getSchemaClass()} theme-toggle pointer">
							<span class="icon "> </span>
						</button>
					</div>
				</div>
			</div>
		`;
	}

	_openTab(tabId) {
		const { isPortrait, tabIndex } = this.getModel();
		// handle current tool if necessary
		switch (tabId) {
			case TabIds.ROUTING:
				setCurrentTool(Tools.ROUTING);
				break;
			case TabIds.FEATUREINFO:
				setCurrentTool(null);
				break;
		}
		isPortrait || tabId === tabIndex ? toggle() : open();
		setTab(tabId);
	}

	_showTimeTravel() {
		if (this.#storeService.getStore().getState().timeTravel.active) {
			this._openTab(TabIds.MAPS);
		} else {
			this.#predefinedConfigurationService.apply(PredefinedConfiguration.DISPLAY_TIME_TRAVEL);
		}
	}

	_showLegend() {
		if (this.#storeService.getStore().getState().legend.legendActive) {
			deactivateLegend();
		} else {
			activateLegend();
		}
	}

	static get tag() {
		return 'ba-navigation-rail';
	}
}
