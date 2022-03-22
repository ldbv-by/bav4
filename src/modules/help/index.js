import './i18n';
import { FirstSteps } from './components/FirstSteps';
if (!window.customElements.get(FirstSteps.tag)) {
	window.customElements.define(FirstSteps.tag, FirstSteps);
}
