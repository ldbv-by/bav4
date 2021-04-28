import { SearchResultsPanel } from './SearchResultsPanel';
import { LocationResultsPanel } from './items/location/LocationResultsPanel';
import { LocationResultItem } from './items/location/LocationResultItem';
import { GeoResouceResultsPanel } from './items/geoResource/GeoResourceResultsPanel';
import { GeoResourceResultItem } from './items/geoResource/GeoResourceResultItem';
if (!window.customElements.get(SearchResultsPanel.tag)) {
	window.customElements.define(SearchResultsPanel.tag, SearchResultsPanel);
}
if (!window.customElements.get(LocationResultsPanel.tag)) {
	window.customElements.define(LocationResultsPanel.tag, LocationResultsPanel);
}
if (!window.customElements.get(LocationResultItem.tag)) {
	window.customElements.define(LocationResultItem.tag, LocationResultItem);
}
if (!window.customElements.get(GeoResouceResultsPanel.tag)) {
	window.customElements.define(GeoResouceResultsPanel.tag, GeoResouceResultsPanel);
}
if (!window.customElements.get(GeoResourceResultItem.tag)) {
	window.customElements.define(GeoResourceResultItem.tag, GeoResourceResultItem);
}