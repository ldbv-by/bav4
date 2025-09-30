import './i18n';
import { AdminUI } from './components/AdminUI';
import { AdminCatalog } from './components/AdminCatalog';
import { AdminCatalogBranchPanel } from './components/AdminCatalogBranchPanel';
import { AdminCatalogPublishPanel } from './components/AdminCatalogPublishPanel';
import { AdminCatalogConfirmActionPanel } from './components/AdminCatalogConfirmActionPanel';

if (!window.customElements.get(AdminCatalogConfirmActionPanel.tag)) {
	window.customElements.define(AdminCatalogConfirmActionPanel.tag, AdminCatalogConfirmActionPanel);
}

if (!window.customElements.get(AdminCatalogBranchPanel.tag)) {
	window.customElements.define(AdminCatalogBranchPanel.tag, AdminCatalogBranchPanel);
}

if (!window.customElements.get(AdminCatalogPublishPanel.tag)) {
	window.customElements.define(AdminCatalogPublishPanel.tag, AdminCatalogPublishPanel);
}

if (!window.customElements.get(AdminCatalog.tag)) {
	window.customElements.define(AdminCatalog.tag, AdminCatalog);
}

if (!window.customElements.get(AdminUI.tag)) {
	window.customElements.define(AdminUI.tag, AdminUI);
}
