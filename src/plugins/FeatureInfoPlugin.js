import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { clearFeatureInfoItems, updateCoordinate } from '../store/featureInfo/featureInfo.action';
import { TabIndex } from '../store/mainMenu/mainMenu.action';


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

		const onPointerClick = (evt) => {
			const { payload: { coordinate } } = evt;
			clearFeatureInfoItems();
			updateCoordinate(coordinate);
		};

		const onTabIndexChanged = (tabIndex) => {
			if (tabIndex !== TabIndex.FEATUREINFO) {
				clearFeatureInfoItems();
			}
		};

		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
