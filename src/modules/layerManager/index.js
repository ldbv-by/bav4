import './i18n';
import { LayerItem } from './components/LayerItem';
import { LayerManager } from './components/LayerManager';
import { LayerSettingsPanel } from './components/LayerSettingsPanel';

if (!window.customElements.get(LayerItem.tag)) {
	window.customElements.define(LayerItem.tag, LayerItem);
}
if (!window.customElements.get(LayerManager.tag)) {
	window.customElements.define(LayerManager.tag, LayerManager);
}
if (!window.customElements.get(LayerSettingsPanel.tag)) {
	window.customElements.define(LayerSettingsPanel.tag, LayerSettingsPanel);
}
