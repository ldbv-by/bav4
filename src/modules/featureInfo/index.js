import './i18n';
import { FeatureInfoPanel } from './components/FeatureInfoPanel';
if (!window.customElements.get(FeatureInfoPanel.tag)) {
	window.customElements.define(FeatureInfoPanel.tag, FeatureInfoPanel);
}
