import './i18n';
import { GeoResourceInfoPanel } from './components/GeoResourceInfoPanel';
if (!window.customElements.get(GeoResourceInfoPanel.tag)) {
	window.customElements.define(GeoResourceInfoPanel.tag, GeoResourceInfoPanel);
}
