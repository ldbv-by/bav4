import './i18n';
import { AdminUI } from './components/AdminUI';
import { AdminCatalog } from './components/AdminCatalog';

if (!window.customElements.get(AdminCatalog.tag)) {
	window.customElements.define(AdminCatalog.tag, AdminCatalog);
}

if (!window.customElements.get(AdminUI.tag)) {
	window.customElements.define(AdminUI.tag, AdminUI);
}
