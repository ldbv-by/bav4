import { SearchResultsPanel } from './SearchResultsPanel';
import { LocationResultsPanel } from './types/location/LocationResultsPanel';
import { LocationResultItem } from './types/location/LocationResultItem';
import { GeoResouceResultsPanel } from './types/geoResource/GeoResourceResultsPanel';
import { GeoResourceResultItem } from './types/geoResource/GeoResourceResultItem';
import { CpResultsPanel } from './types/cp/CpResultsPanel';
import { CpResultItem } from './types/cp/CpResultItem';
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
if (!window.customElements.get(CpResultsPanel.tag)) {
	window.customElements.define(CpResultsPanel.tag, CpResultsPanel);
}
if (!window.customElements.get(CpResultItem.tag)) {
	window.customElements.define(CpResultItem.tag, CpResultItem);
}
