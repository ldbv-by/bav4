import { SearchContentPanel } from './SearchContentPanel';
import { LocationResultItem } from './items/location/LocationResultItem';
import { GeoResourceResultItem } from './items/geoResource/GeoResourceResultItem';
if (!window.customElements.get(SearchContentPanel.tag)) {
	window.customElements.define(SearchContentPanel.tag, SearchContentPanel);
}
if (!window.customElements.get(LocationResultItem.tag)) {
	window.customElements.define(LocationResultItem.tag, LocationResultItem);
}
if (!window.customElements.get(GeoResourceResultItem.tag)) {
	window.customElements.define(GeoResourceResultItem.tag, GeoResourceResultItem);
}