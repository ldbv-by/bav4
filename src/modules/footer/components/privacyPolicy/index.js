import { PrivacyPolicy } from './PrivacyPolicy';
if (!window.customElements.get(PrivacyPolicy.tag)) {
	window.customElements.define(PrivacyPolicy.tag, PrivacyPolicy);
}
