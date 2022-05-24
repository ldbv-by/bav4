import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { close, open, setTab, TabId } from '../store/mainMenu/mainMenu.action';
import { $injector } from '../injection';
import { QueryParameters } from '../services/domain/queryParameters';


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
		const { EnvironmentService: environmentService }
			= $injector.inject('EnvironmentService');
		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);

		// check if we have a query parameter defining the tab id
		const tabId = TabId.valueOf(parseInt(queryParams.get(QueryParameters.MENU_ID), 10));
		if (tabId) {
			setTab(tabId);
		}
		else { // set default tab id
			setTab(TabId.TOPICS);
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
			const { featureInfo: { current } } = state;
			if (!querying) {

				if (current.length === 0) {
					if (!this._open) {
						close();
					}
					setTab(this._previousTab);
				}
				else {
					setTab(TabId.FEATUREINFO);
					open();
				}
			}
		};

		const onFeatureInfoAbortedChanged = () => {

			if (!this._open) {
				close();
			}
			setTab(this._previousTab);
		};

		const onQueryChanged = ({ payload }) => {

			if (payload) {
				setTab(TabId.SEARCH);
				open();
			}
		};

		const onTabChanged = (tab, state) => {
			if (tab === TabId.FEATUREINFO) {
				this._open = state.mainMenu.open;
			}
			else {
				this._previousTab = tab;
			}
		};

		observe(store, state => state.featureInfo.querying, onFeatureInfoQueryingChanged);
		observe(store, state => state.featureInfo.aborted, onFeatureInfoAbortedChanged);
		observe(store, state => state.search.query, onQueryChanged, false);
		observe(store, store => store.mainMenu.tab, onTabChanged, false);
	}
}
