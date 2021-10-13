import { observe } from '../../utils/storeUtils';
import { BaPlugin } from '../../store/BaPlugin';
import { add, clear } from './featureInfo.action';
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

		const onPointerClick = () => {
			add({ title: 'title', content: html`<div>myFeatureInfo</div>` });
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
