import './i18n';
import { Survey } from './components/Survey';
if (!window.customElements.get(Survey.tag)) {
	window.customElements.define(Survey.tag, Survey);
}
