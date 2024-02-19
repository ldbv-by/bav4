import { $injector } from '../../../../src/injection';
import { BvvPlusPasswordCredentialFooter } from '../../../../src/modules/auth/components/BvvPlusPasswordCredentialFooter';
import { TestUtils } from '../../../test-utils';
window.customElements.define(BvvPlusPasswordCredentialFooter.tag, BvvPlusPasswordCredentialFooter);

describe('BvvPlusPasswordCredentialFooter', () => {
	const setup = async (state = {}) => {
		const initialState = {
			notifications: {
				notification: null
			},
			media: {
				portrait: false
			},
			...state
		};
		TestUtils.setupStoreAndDi(initialState, {});

		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(BvvPlusPasswordCredentialFooter.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new BvvPlusPasswordCredentialFooter().getModel();

			expect(model).toEqual({});
		});
	});
	describe('when footer is rendered', () => {
		it('displays the information text', async () => {
			const element = await setup();
			expect(element.shadowRoot.textContent.includes('auth_passwordCredentialPanel_footer_register_for_role_prefix')).toBeTrue();
			expect(element.shadowRoot.textContent.includes('auth_passwordCredentialPanel_footer_register_for_role_suffix')).toBeTrue();
			expect(element.shadowRoot.textContent.includes('auth_passwordCredentialPanel_footer_register_information_prefix')).toBeTrue();
			expect(element.shadowRoot.textContent.includes('auth_passwordCredentialPanel_footer_register_information_suffix')).toBeTrue();
		});

		it('displays the anchors', async () => {
			const element = await setup();

			const anchors = element.shadowRoot.querySelectorAll('a');
			expect(anchors).toHaveSize(3);
			expect(anchors[0].href).toBe('https://www.ldbv.bayern.de/produkte/dienste/bayernatlas.html');
			expect(anchors[0].textContent).toBe('auth_passwordCredentialPanel_footer_register_information');
			expect(anchors[1].href).toBe('https://geodatenonline.bayern.de/geodatenonline/anwendungen4/kontakt');
			expect(anchors[1].textContent).toBe('auth_passwordCredentialPanel_footer_forgot_login');
			expect(anchors[2].href).toBe('https://geodatenonline.bayern.de/geodatenonline/anwendungen4/passwortvergessen');
			expect(anchors[2].textContent).toBe('auth_passwordCredentialPanel_footer_forgot_password');
		});
	});
});
