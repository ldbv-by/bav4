import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { clearFeatureInfoItems, updateCoordinate } from '../store/featureInfo/featureInfo.action';
import { close, open, setTabIndex, TabIndex } from '../store/mainMenu/mainMenu.action';


/**
 * @class
 * @author taulinger
 */
export class FeatureInfoPlugin extends BaPlugin {

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		let previousTabIndex = 0;
		let wasOpen = null;

		const onPointerClick = (evt) => {
			const { payload: { coordinate } } = evt;
			clearFeatureInfoItems();
			updateCoordinate(coordinate);
		};

		const onFeatureInfoChanged = current => {
			if (current.length === 0) {
				if (!wasOpen) {
					close();
				}
				setTabIndex(previousTabIndex);
			}
			else {
				//Todo: check if we are in portrait mode. If true, we first display a notification
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
				clearFeatureInfoItems();
			}
		};

		observe(store, state => state.featureInfo.current, onFeatureInfoChanged);
		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
