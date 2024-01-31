/**
 * @module plugins/NavigationRailPlugin
 */
import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { open, addTabId, close } from '../store/navigationRail/navigationRail.action';
import { TabIds } from '../domain/mainMenu';

/**
 * @class
 * @author alsturm
 */
export class NavigationRailPlugin extends BaPlugin {
	constructor() {
		super();
		this._openMainMenu = null;
		this._openNavigationRail = null;
		this._isPortrait = null;
	}

	_init() {}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		this._init();
		this._openNavigationRail = store.getState().navigationRail.open;
		this._isPortrait = store.getState().media.portrait;

		const onTabChanged = (tab, state) => {
			this._openMainMenu = state.mainMenu.open;
			if ((tab === TabIds.FEATUREINFO || tab === TabIds.ROUTING) && !this._isPortrait) {
				addTabId(tab);
				//TEMP
				close();
				open();
			}
		};

		observe(store, (store) => store.mainMenu.tab, onTabChanged, false);
	}
}
