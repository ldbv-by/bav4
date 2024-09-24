/**
 * @module plugins/MainMenuPlugin
 */
import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { close, open, setTab } from '../store/mainMenu/mainMenu.action';
import { TabIds } from '../domain/mainMenu';
import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { Tools } from '../domain/tools';

/**
 * @class
 * @author taulinger
 */
export class MainMenuPlugin extends BaPlugin {
	constructor() {
		super();
		this._previousTab = null;
		this._open = null;
	}

	_init() {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		const queryParams = environmentService.getQueryParams();

		// check if we have a query parameter defining the tab id
		const tabId = TabIds.valueOf(parseInt(queryParams.get(QueryParameters.MENU_ID), 10));
		if (tabId) {
			setTab(tabId);
		} else {
			// set default tab id
			setTab(TabIds.MAPS);
		}
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		this._init();

		this._open = store.getState().mainMenu.open;
		this._previousTab = store.getState().mainMenu.tab;

		const onFeatureInfoQueryingChanged = (querying, state) => {
			if (!querying && state.featureInfo.current.length > 0) {
				setTab(TabIds.FEATUREINFO);
				open();
			}
		};

		const onFeatureInfoAbortedChanged = (_, state) => {
			if (state.mainMenu.tab === TabIds.FEATUREINFO) {
				if (!this._open) {
					close();
				}
				setTab(this._previousTab);
			}
		};

		const onQueryChanged = ({ payload }) => {
			if (payload) {
				setTab(TabIds.SEARCH);
				open();
			}
		};

		const onTabChanged = (tab, state) => {
			if (tab === TabIds.FEATUREINFO || tab === TabIds.ROUTING) {
				this._open = state.mainMenu.open;
			} else {
				this._previousTab = tab;
			}
		};

		const onToolIdChanged = (toolId, state) => {
			// close routing Tab
			if (toolId !== Tools.ROUTING && state.mainMenu.tab === TabIds.ROUTING) {
				setTab(this._previousTab);

				if (state.media.portrait) {
					close();
				}
			}

			// open routing Tab
			if (toolId === Tools.ROUTING) {
				setTab(TabIds.ROUTING);
				open();
			}
		};

		const onOrientationChanged = (portrait, state) => {
			// no closed full-size panel on landscape mode
			if (!portrait && (state.mainMenu.tab === TabIds.ROUTING || state.mainMenu.tab === TabIds.FEATUREINFO)) {
				open();
			}
		};

		observe(store, (state) => state.featureInfo.querying, onFeatureInfoQueryingChanged);
		observe(store, (state) => state.featureInfo.aborted, onFeatureInfoAbortedChanged);
		observe(store, (state) => state.search.query, onQueryChanged, false);
		observe(store, (store) => store.mainMenu.tab, onTabChanged, false);
		observe(store, (state) => state.tools.current, onToolIdChanged, false);
		observe(store, (state) => state.media.portrait, onOrientationChanged, false);
	}
}
