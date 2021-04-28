import { SearchResultsPanel } from './SearchResultsPanel';
import { LocationResultsPanel } from './types/location/LocationResultsPanel';
import { LocationResultItem } from './types/location/LocationResultItem';
import { GeoResouceResultsPanel } from './types/geoResource/GeoResourceResultsPanel';
import { GeoResourceResultItem } from './types/geoResource/GeoResourceResultItem';
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