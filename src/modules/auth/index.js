import './i18n';
import './components/PasswordCredentialPanel';
import { PasswordCredentialPanel } from './components/PasswordCredentialPanel';
if (!window.customElements.get(PasswordCredentialPanel.tag)) {
	window.customElements.define(PasswordCredentialPanel.tag, PasswordCredentialPanel);
}
