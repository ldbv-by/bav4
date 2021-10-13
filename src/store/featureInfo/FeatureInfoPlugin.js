import { observe } from '../../utils/storeUtils';
import { BaPlugin } from '../../store/BaPlugin';
import { add, updateFeatureInfo } from './featureInfo.action';
import { html } from 'lit-html';
import { close, open, setTabIndex, TabIndex } from '../../modules/menu/store/mainMenu.action';


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

		const onPointerClick = async () => {
			add({ title: 'title', content: html`<div>myFeatureInfo</div>` });
			setTabIndex(TabIndex.FEATUREINFO);
			open();
		};

		const onFeatureInfoChanged = async (current) => {
			if (current.length === 0) {
				if (!wasOpen) {
					close();
				}
				setTabIndex(previousTabIndex);
			}
		};

		observe(store, state => state.featureInfo.current, onFeatureInfoChanged);
		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tabIndex, (tabIndex, state) => {
			if (tabIndex !== TabIndex.FEATUREINFO) {
				previousTabIndex = tabIndex;
			}
			else {
				wasOpen = state.mainMenu.open;
			}
		}, false);
	}
}
