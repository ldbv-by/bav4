// import './i18n';

import { AdminPanel } from './components/panel/AdminPanel';
import { LayerTree } from './components/layerTree/LayerTree';

if (!window.customElements.get(AdminPanel.tag)) {
	window.customElements.define(AdminPanel.tag, AdminPanel);
}

if (!window.customElements.get(LayerTree.tag)) {
	window.customElements.define(LayerTree.tag, LayerTree);
}

// if (!window.customElements.get(LayerList.tag)) {
// 	window.customElements.define(LayerList.tag, LayerList);
// }
