import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../store/BaPlugin';
import { add, clear, updateCoordinate } from '../store/featureInfo/featureInfo.action';
import { close, open, setTabIndex, TabIndex } from '../modules/menu/store/mainMenu.action';


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
			clear();
			updateCoordinate(coordinate);
			//we simulate a FeatureInfo item here. Later we will call the FeatureInfoService.
			add({ title: 'title', content: '<div>myFeatureInfo</div>' });
			//Todo: check if we are in portrait mode. Of true we first show a notification
			setTabIndex(TabIndex.FEATUREINFO);
			open();
		};

		const onFeatureInfoChanged = current => {
			if (current.length === 0) {
				if (!wasOpen) {
					close();
				}
				setTabIndex(previousTabIndex);
			}
		};

		const onTabIndexChanged = (tabIndex, state) => {
			if (tabIndex === TabIndex.FEATUREINFO) {
				wasOpen = state.mainMenu.open;
			}
			else {
				previousTabIndex = tabIndex;
				clear();
			}
		};

		observe(store, state => state.featureInfo.current, onFeatureInfoChanged);
		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
