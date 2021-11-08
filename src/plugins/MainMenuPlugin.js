import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { close, open, setTabIndex, TabIndex } from '../store/mainMenu/mainMenu.action';


/**
 * @class
 * @author taulinger
 */
export class MainMenuPlugin extends BaPlugin {

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		let previousTabIndex = 0;
		let wasOpen = null;

		const onFeatureInfoChanged = current => {
			if (current.length === 0) {
				if (!wasOpen) {
					close();
				}
				setTabIndex(previousTabIndex);
			}
			else {
				setTabIndex(TabIndex.FEATUREINFO);
				open();
			}
		};

		const onTabIndexChanged = (tabIndex, state) => {
			if (tabIndex === TabIndex.FEATUREINFO) {
				wasOpen = state.mainMenu.open;
			}
			else {
				previousTabIndex = tabIndex;
			}
		};

		observe(store, state => state.featureInfo.current, onFeatureInfoChanged);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
