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
			//Fixme: we simulate a FeatureInfo item here. Later we will call the FeatureInfoService.
			add({ title: 'title', content: '<p><b>Gasthaus Schloss Blumenthal</b></p>Wirtshaus, bewirtschaftete Alm<br/>Blumenthal 1 <br/>86551 Aichach a d Paar<br/><br/><b>Weitere Informationen finden Sie unter:</b><br/><a href="https://www.schloss-blumenthal.de/gasthaus-biergarten/#!/gh_main" target="_blank">Gasthaus Schloss Blumenthal</a>"' });
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
				clear();
			}
		};

		observe(store, state => state.featureInfo.current, onFeatureInfoChanged);
		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
