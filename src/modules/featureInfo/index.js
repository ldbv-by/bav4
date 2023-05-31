import './i18n';
import { FeatureInfoPanel } from './components/featureInfoPanel/FeatureInfoPanel';
import { GeometryInfo } from './components/geometryInfo/GeometryInfo';
import { FeatureInfoIframePanel } from './components/featureInfoIframePanel/FeatureInfoIframePanel';
if (!window.customElements.get(FeatureInfoPanel.tag)) {
	window.customElements.define(FeatureInfoPanel.tag, FeatureInfoPanel);
}
if (!window.customElements.get(FeatureInfoIframePanel.tag)) {
	window.customElements.define(FeatureInfoIframePanel.tag, FeatureInfoIframePanel);
}
if (!window.customElements.get(GeometryInfo.tag)) {
	window.customElements.define(GeometryInfo.tag, GeometryInfo);
}
