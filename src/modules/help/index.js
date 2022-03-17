import './i18n';
import { Help } from './components/Help';
if (!window.customElements.get(Help.tag)) {
	window.customElements.define(Help.tag, Help);
}
