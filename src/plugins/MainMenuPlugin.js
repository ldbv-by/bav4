import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { close, open, setTabIndex, TabIndex } from '../store/mainMenu/mainMenu.action';


/**
 * @class
 * @author taulinger
 */
export class MainMenuPlugin extends BaPlugin {

	constructor() {
		super();
		this._previousTabIndex = -1;
		this._open = null;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		this._open = store.getState().mainMenu.open;
		this._previousTabIndex = store.getState().mainMenu.tabIndex;

		const onFeatureInfoQueryingChanged = (querying, state) => {
			const { featureInfo: { current } } = state;
			if (!querying) {

				if (current.length === 0) {
					if (!this._open) {
						close();
					}
					setTabIndex(this._previousTabIndex);
				}
				else {
					setTabIndex(TabIndex.FEATUREINFO);
					open();
				}
			}
		};

		const onFeatureInfoAbortedChanged = () => {

			if (!this._open) {
				close();
			}
			setTabIndex(this._previousTabIndex);
		};

		const onTabIndexChanged = (tabIndex, state) => {
			if (tabIndex === TabIndex.FEATUREINFO) {
				this._open = state.mainMenu.open;
			}
			else {
				this._previousTabIndex = tabIndex;
			}
		};

		observe(store, state => state.featureInfo.querying, onFeatureInfoQueryingChanged);
		observe(store, state => state.featureInfo.aborted, onFeatureInfoAbortedChanged);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
