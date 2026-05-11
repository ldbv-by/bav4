import './i18n';
import { GeoResourceInfoPanel } from './components/GeoResourceInfoPanel';
import { LastModifiedItem } from './components/LastModifiedItem';
if (!window.customElements.get(GeoResourceInfoPanel.tag)) {
	window.customElements.define(GeoResourceInfoPanel.tag, GeoResourceInfoPanel);
}
if (!window.customElements.get(LastModifiedItem.tag)) {
	window.customElements.define(LastModifiedItem.tag, LastModifiedItem);
}
