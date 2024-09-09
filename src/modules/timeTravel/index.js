import './i18n';
import { TimeTravel } from './components/TimeTravel';
if (!window.customElements.get(TimeTravel.tag)) {
	window.customElements.define(TimeTravel.tag, TimeTravel);
}
