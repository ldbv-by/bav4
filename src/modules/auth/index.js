import './i18n';
import './components/BaaCredentialPanel';
import { BaaCredentialPanel } from './components/BaaCredentialPanel';
if (!window.customElements.get(BaaCredentialPanel.tag)) {
	window.customElements.define(BaaCredentialPanel.tag, BaaCredentialPanel);
}
