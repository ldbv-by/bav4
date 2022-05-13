import './i18n';
import './components/BaaCredentialsPanel';
import { BaaCredentialsPanel } from './components/BaaCredentialsPanel';
if (!window.customElements.get(BaaCredentialsPanel.tag)) {
	window.customElements.define(BaaCredentialsPanel.tag, BaaCredentialsPanel);
}
