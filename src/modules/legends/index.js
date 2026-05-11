//import './i18n';
import { LegendPanel } from './components/LegendPanel';

if (!window.customElements.get(LegendPanel.tag)) {
	window.customElements.define(LegendPanel.tag, LegendPanel);
}
