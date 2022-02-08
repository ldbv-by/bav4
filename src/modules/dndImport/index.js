import './i18n';
import { DndImportPanel } from './components/DndImportPanel';

if (!window.customElements.get(DndImportPanel.tag)) {
	window.customElements.define(DndImportPanel.tag, DndImportPanel);
}
