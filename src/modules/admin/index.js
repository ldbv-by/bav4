import './i18n';
import { AdminUI } from './components/AdminUI';
import { Catalog } from './components/Catalog';

if (!window.customElements.get(Catalog.tag)) {
	window.customElements.define(Catalog.tag, Catalog);
}

if (!window.customElements.get(AdminUI.tag)) {
	window.customElements.define(AdminUI.tag, AdminUI);
}
