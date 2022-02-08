import './i18n';
import { DnDImportPanel } from './components/DndImportPanel';

if (!window.customElements.get(DnDImportPanel.tag)) {
    window.customElements.define(DnDImportPanel.tag, DnDImportPanel);
}
