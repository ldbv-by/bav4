import './i18n';
import { FeatureInfoPanel } from './components/FeatureInfoPanel';
import { GeometryInfo } from './components/GeometryInfo';
if (!window.customElements.get(FeatureInfoPanel.tag)) {
	window.customElements.define(FeatureInfoPanel.tag, FeatureInfoPanel);
}
if (!window.customElements.get(GeometryInfo.tag)) {
	window.customElements.define(GeometryInfo.tag, GeometryInfo);
}
