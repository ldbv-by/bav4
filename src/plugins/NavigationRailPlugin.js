/**
 * @module plugins/NavigationRailPlugin
 */

import { TabIds } from '../domain/mainMenu';
import { BaPlugin } from '../plugins/BaPlugin';
import { addTabId, open } from '../store/navigationRail/navigationRail.action';
import { observe } from '../utils/storeUtils';

/**
 * This plugin observes the 'tab' property of the mainMenu slice-of-state and shows
 * the NavigationRail component and saves the tab id.
 * @class
 * @author alsturm
 */
export class NavigationRailPlugin extends BaPlugin {
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const onTabChanged = (tab) => {
			if ((tab === TabIds.FEATUREINFO || tab === TabIds.ROUTING) && !store.getState().media.portrait) {
				addTabId(tab);
				open();
			}
		};

		observe(store, (store) => store.mainMenu.tab, onTabChanged, false);
	}
}
