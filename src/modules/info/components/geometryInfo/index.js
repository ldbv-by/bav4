import { GeometryInfo } from './GeometryInfo';
if (!window.customElements.get(GeometryInfo.tag)) {
	window.customElements.define(GeometryInfo.tag, GeometryInfo);
}
