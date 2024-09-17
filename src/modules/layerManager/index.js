import './i18n';
import { LayerManager } from './components/LayerManager';
import { LayerItem } from './components/LayerItem';
import { ValueSelect } from './components/ValueSelect';

if (!window.customElements.get(ValueSelect.tag)) {
	window.customElements.define(ValueSelect.tag, ValueSelect);
}
if (!window.customElements.get(LayerItem.tag)) {
	window.customElements.define(LayerItem.tag, LayerItem);
}
if (!window.customElements.get(LayerManager.tag)) {
	window.customElements.define(LayerManager.tag, LayerManager);
}
