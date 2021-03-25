import { GeoResourceInfo } from './GeoResourceInfo';
if (!window.customElements.get(GeoResourceInfo.tag)) {
	window.customElements.define(GeoResourceInfo.tag, GeoResourceInfo);
} 