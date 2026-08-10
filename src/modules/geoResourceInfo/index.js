import './i18n';
import { GeoResourceInfoPanel } from './components/GeoResourceInfoPanel';
import { LastModifiedItem } from './components/LastModifiedItem';
import { GeoResourceTypeBadge } from './components/GeoResourceTypeBadge';
import { GeoResourceBadge } from './components/GeoResourceBadge';

if (!window.customElements.get(GeoResourceInfoPanel.tag)) {
	window.customElements.define(GeoResourceInfoPanel.tag, GeoResourceInfoPanel);
}
if (!window.customElements.get(LastModifiedItem.tag)) {
	window.customElements.define(LastModifiedItem.tag, LastModifiedItem);
}
if (!window.customElements.get(GeoResourceTypeBadge.tag)) {
	window.customElements.define(GeoResourceTypeBadge.tag, GeoResourceTypeBadge);
}

if (!window.customElements.get(GeoResourceBadge.tag)) {
	window.customElements.define(GeoResourceBadge.tag, GeoResourceBadge);
}
