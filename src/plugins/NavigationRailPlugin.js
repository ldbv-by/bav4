/**
 * @module plugins/NavigationRailPlugin
 */
import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { openNav } from '../store/navigationRail/navigationRail.action';
import { TabIds } from '../domain/mainMenu';

/**
 * @class
 * @author alsturm
 */
export class NavigationRailPlugin extends BaPlugin {
	constructor() {
		super();
		this._open = null;
		this._openNav = null;
	}

	_init() {}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		this._init();
		this._openNav = store.getState().navigationRail.openNav;

		const onTabChanged = (tab, state) => {
			console.log('changeTAb');
			if (tab === TabIds.FEATUREINFO || tab === TabIds.ROUTING) {
				this._open = state.mainMenu.open;
				console.log('openNav');
				openNav();
			}
		};

		observe(store, (store) => store.mainMenu.tab, onTabChanged, false);
	}
}
