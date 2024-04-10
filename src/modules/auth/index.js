import './i18n';
import './components/PasswordCredentialPanel';
import { PasswordCredentialPanel } from './components/PasswordCredentialPanel';
import { BvvPlusPasswordCredentialFooter } from './components/BvvPlusPasswordCredentialFooter';
if (!window.customElements.get(PasswordCredentialPanel.tag)) {
	window.customElements.define(PasswordCredentialPanel.tag, PasswordCredentialPanel);
}
if (!window.customElements.get(BvvPlusPasswordCredentialFooter.tag)) {
	window.customElements.define(BvvPlusPasswordCredentialFooter.tag, BvvPlusPasswordCredentialFooter);
}
