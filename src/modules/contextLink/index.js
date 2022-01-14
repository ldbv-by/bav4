import './i18n';
import { ContextLink } from './components/ContextLink';
if (!window.customElements.get(ContextLink.tag)) {
	window.customElements.define(ContextLink.tag, ContextLink);
}
