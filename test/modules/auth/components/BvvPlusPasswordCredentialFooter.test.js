import { html } from 'lit-html';
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

		$injector.registerSingleton('TranslationService', { translate: (key, params) => html`${key}${params[0] ?? ''}` });

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
			const section = element.shadowRoot.querySelector('.footer_register');
			expect(section.textContent).toContain('auth_passwordCredentialPanel_footer_register_for_role');
			expect(section.textContent).toContain('auth_passwordCredentialPanel_footer_register_information');
			expect(section.textContent).toContain('https://www.ldbv.bayern.de/produkte/dienste/bayernatlas.html');

			expect(section.querySelector('ba-badge').label).toBe('Plus');
			expect(section.querySelector('ba-badge').color).toBe('var(--text3)');
			expect(section.querySelector('ba-badge').background).toBe('var(--primary-color)');
		});

		it('displays the anchors', async () => {
			const element = await setup();

			const anchors = element.shadowRoot.querySelectorAll('a');
			expect(anchors).toHaveSize(2);
			expect(anchors[0].href).toBe('https://geodatenonline.bayern.de/geodatenonline/anwendungen4/kontakt');
			expect(anchors[0].textContent).toBe('auth_passwordCredentialPanel_footer_forgot_login');
			expect(anchors[0].target).toBe('_blank');
			expect(anchors[1].href).toBe('https://geodatenonline.bayern.de/geodatenonline/anwendungen4/passwortvergessen');
			expect(anchors[1].textContent).toBe('auth_passwordCredentialPanel_footer_forgot_password');
			expect(anchors[1].target).toBe('_blank');
		});
	});
});
