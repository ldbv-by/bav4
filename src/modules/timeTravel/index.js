import './i18n';
import { TimeTravelSlider } from './components/TimeTravelSlider';
if (!window.customElements.get(TimeTravelSlider.tag)) {
	window.customElements.define(TimeTravelSlider.tag, TimeTravelSlider);
}
