import './i18n';
import { Survey } from './components/survey';
if (!window.customElements.get(Survey.tag)) {
	window.customElements.define(Survey.tag, Survey);
}
