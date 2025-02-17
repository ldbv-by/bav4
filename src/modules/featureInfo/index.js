import './i18n';
import { FeatureInfoPanel } from './components/featureInfoPanel/FeatureInfoPanel';
import { FeatureInfoIframePanel } from './components/featureInfoIframePanel/FeatureInfoIframePanel';
if (!window.customElements.get(FeatureInfoPanel.tag)) {
	window.customElements.define(FeatureInfoPanel.tag, FeatureInfoPanel);
}
if (!window.customElements.get(FeatureInfoIframePanel.tag)) {
	window.customElements.define(FeatureInfoIframePanel.tag, FeatureInfoIframePanel);
}
