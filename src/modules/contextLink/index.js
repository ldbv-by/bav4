// import './i18n';
import { ContextLinks } from './components/ContextLinks';
if (!window.customElements.get(ContextLinks.tag)) {
	window.customElements.define(ContextLinks.tag, ContextLinks);
}
