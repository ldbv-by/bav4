/* eslint-disable no-undef */

import { PrivacyPolicy } from '../../../../../src/modules/footer/components/privacyPolicy/PrivacyPolicy';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
window.customElements.define(PrivacyPolicy.tag, PrivacyPolicy);

describe('PrivacyPolicy', () => {
	const setup = async () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(PrivacyPolicy.tag);
	};

	describe('when initialized', () => {
		it('contains a link', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.privacy_policy-container')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.privacy-policy-link')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.privacy-policy-link')[0].href).toContain('global_privacy_policy_url');
			expect(element.shadowRoot.querySelectorAll('.privacy-policy-link')[0].target).toBe('_blank');
			expect(element.shadowRoot.querySelectorAll('.privacy-policy-link')[0].textContent).toBe('footer_privacy_policy_link');
			expect(element.shadowRoot.querySelectorAll('.privacy-policy-link')[0].title).toBe('footer_privacy_policy_link');
		});
	});
});
