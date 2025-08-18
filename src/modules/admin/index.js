// import './i18n';
import { AdminUI } from './components/AdminUI';

if (!window.customElements.get(AdminUI.tag)) {
	window.customElements.define(AdminUI.tag, AdminUI);
}
