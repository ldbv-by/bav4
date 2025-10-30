import { AbstractMvuContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { BvvMiscContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/misc/BvvMiscContentPanel';
import { TestUtils } from '../../../../../../test-utils';
import { $injector } from '../../../../../../../src/injection';
import { ToggleFeedbackPanel } from '../../../../../../../src/modules/feedback/components/toggleFeedback/ToggleFeedbackPanel';
import { modalReducer } from '../../../../../../../src/store/modal/modal.reducer';
import { authReducer } from '../../../../../../../src/store/auth/auth.reducer';
import { setSignedIn, setSignedOut } from '../../../../../../../src/store/auth/auth.action';
import { closeModal } from '../../../../../../../src/store/modal/modal.action';
import { Switch } from '../../../../../../../src/modules/commons/components/switch/Switch';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';

window.customElements.define(BvvMiscContentPanel.tag, BvvMiscContentPanel);
window.customElements.define(Switch.tag, Switch);

const authService = {
	isSignedIn: () => {},
	getRoles: () => {},
	signIn: () => {},
	signOut: () => {}
};

const configService = {
	getValue: () => {}
};

describe('MiscContentPanel', () => {
	let store;
	const setup = (state = {}) => {
		const initialState = {
			media: {
				darkSchema: true,
				highContrast: false
			},
			auth: {
				signedIn: false
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, { media: createNoInitialStateMediaReducer(), modal: modalReducer, auth: authReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('AuthService', authService)
			.registerSingleton('ConfigService', configService);

		return TestUtils.render(BvvMiscContentPanel.tag);
	};

	describe('class', () => {
		it('inherits from AbstractContentPanel', async () => {
			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new BvvMiscContentPanel().getModel();

			expect(model).toEqual({
				darkSchema: false,
				highContrast: false,
				active: false,
				signedIn: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll(Switch.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(Switch.tag)[0].checked).toBeTrue();
		});

		it('checks the list ', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__header').length).toBe(2);
			expect(element.shadowRoot.querySelectorAll('a').length).toBe(10);
			expect(element.shadowRoot.querySelectorAll('[href]').length).toBe(10);
		});

		it('checks all links', async () => {
			const element = await setup();

			const links = element.shadowRoot.querySelectorAll('a');

			expect(links[0].href).toEqual('https://www.ldbv.bayern.de/produkte/dienste/ba_hilfe/index.html');
			expect(links[0].target).toEqual('_blank');
			expect(links[0].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_help');

			expect(links[1].href).toEqual('https://www.ldbv.bayern.de/service/kontakt/');
			expect(links[1].target).toEqual('_blank');
			expect(links[1].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_Contact');

			expect(links[2].href).toContain('global_terms_of_use');
			expect(links[2].target).toEqual('_blank');
			expect(links[2].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_terms_of_use');

			expect(links[3].href).toContain('global_privacy_policy_url');
			expect(links[3].target).toEqual('_blank');
			expect(links[3].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_privacy_policy');

			expect(links[4].href).toEqual('https://geoportal.bayern.de/geoportalbayern/seiten/impressum.html');
			expect(links[4].target).toEqual('_blank');
			expect(links[4].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_imprint');

			expect(links[5].href).toEqual('https://ldbv.bayern.de/service/barrierefreiheit_erklaerung/barrierefreiheit_ba.html');
			expect(links[5].target).toEqual('_blank');
			expect(links[5].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_accessibility');

			expect(links[6].href).toEqual('https://www.ldbv.bayern.de/produkte/dienste/ba_hilfe/ueberblick/neuigkeiten.html');
			expect(links[6].target).toEqual('_blank');
			expect(links[6].querySelector('.ba-list-item__text').innerText).toEqual(
				'menu_misc_content_panel_software_version / menu_misc_content_panel_news'
			);

			expect(links[7].href).toEqual('https://geodatenonline.bayern.de/geodatenonline');
			expect(links[7].target).toEqual('_blank');
			expect(links[7].querySelector('.ba-list-item__primary-text').innerText).toEqual('menu_misc_content_panel_gdo_header');
			expect(links[7].querySelector('.ba-list-item__secondary-text').innerText).toEqual('menu_misc_content_panel_gdo_text');

			expect(links[8].href).toEqual('https://www.geoportal.bayern.de/geoportalbayern');
			expect(links[8].target).toEqual('_blank');
			expect(links[8].querySelector('.ba-list-item__primary-text').innerText).toEqual('menu_misc_content_panel_gp_header');
			expect(links[8].querySelector('.ba-list-item__secondary-text').innerText).toEqual('menu_misc_content_panel_gp_text');

			expect(links[9].href).toEqual('https://www.energieatlas.bayern.de/');
			expect(links[9].target).toEqual('_blank');
			expect(links[9].querySelector('.ba-list-item__primary-text').innerText).toEqual('menu_misc_content_panel_ea_header');
			expect(links[9].querySelector('.ba-list-item__secondary-text').innerText).toEqual('menu_misc_content_panel_ea_text');
		});

		it('contains a feedback button', async () => {
			const element = await setup();

			const feedbackButton = element.shadowRoot.querySelector('#feedback');
			expect(feedbackButton.querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_feedback_title');
			expect(feedbackButton.querySelectorAll('.ba-list-item__icon.icon.feedback')).toHaveSize(1);
		});

		it('contains a signIn button', async () => {
			const element = await setup();

			const signedInButton = element.shadowRoot.querySelector('#authButton');
			expect(signedInButton.querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_login');
			expect(signedInButton.classList.contains('logout')).toBeFalse();
			expect(signedInButton.querySelectorAll('.ba-list-item__icon.icon.person')).toHaveSize(1);
		});

		it('contains a signOut button', async () => {
			const element = await setup({ auth: { signedIn: true } });

			const signedInButton = element.shadowRoot.querySelector('#authButton');
			expect(signedInButton.querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_logout');
			expect(signedInButton.classList.contains('logout')).toBeTrue();
			expect(signedInButton.querySelectorAll('.ba-list-item__icon.icon.person')).toHaveSize(1);
		});

		it('contains a version information', async () => {
			spyOn(configService, 'getValue').withArgs('SOFTWARE_VERSION').and.returnValue('42');
			const element = await setup({ auth: { signedIn: true } });

			const versionInfoAnchor = element.shadowRoot.querySelector('.version-info');
			expect(versionInfoAnchor.querySelectorAll('.ba-list-item__icon.icon.speaker')).toHaveSize(1);
			expect(versionInfoAnchor.href).toEqual('https://www.ldbv.bayern.de/produkte/dienste/ba_hilfe/ueberblick/neuigkeiten.html');
			expect(versionInfoAnchor.target).toEqual('_blank');
			expect(versionInfoAnchor.querySelector('.ba-list-item__text').innerText).toBe(
				'menu_misc_content_panel_software_version 42 / menu_misc_content_panel_news'
			);
		});

		it('opens the modal with the toggle-feedback component', async () => {
			const element = await setup();

			const feedbackButton = element.shadowRoot.querySelector('#feedback');
			feedbackButton.click();

			expect(store.getState().modal.data.title).toBe('menu_misc_content_panel_feedback_title');
			expect(store.getState().modal.steps).toBe(2);
			const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElement.querySelectorAll(ToggleFeedbackPanel.tag)).toHaveSize(1);
			expect(wrapperElement.querySelector(ToggleFeedbackPanel.tag).onSubmit).toEqual(closeModal);
		});

		it('changes the theme with the theme-switch', async () => {
			const element = await setup();
			const themeSwitch = element.shadowRoot.querySelector('#themeToggle');
			expect(element.shadowRoot.querySelectorAll('.ba-list-item-toggle')).toHaveSize(2);

			expect(store.getState().media.darkSchema).toBeTrue();
			expect(element.shadowRoot.querySelectorAll('.sun')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.moon')).toHaveSize(0);

			themeSwitch.click();

			expect(store.getState().media.darkSchema).toBeFalse();
			expect(element.shadowRoot.querySelectorAll('.sun')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.moon')).toHaveSize(1);
		});

		it('changes the contrast with the contrast-switch', async () => {
			const element = await setup();
			const contrastSwitch = element.shadowRoot.querySelector('#contrastToggle');
			expect(element.shadowRoot.querySelectorAll('.ba-list-item-toggle')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.high-contrast-toggle')).toHaveSize(1);

			// only display contrast switch
			// if browser supports @container style
			const supported = window.CSS.supports('@container: Style');
			if (supported) {
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.high-contrast-toggle')).display).toBe('flex');
			} else {
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.high-contrast-toggle')).display).toBe('none');
			}

			expect(store.getState().media.highContrast).toBeFalse();

			contrastSwitch.click();

			expect(store.getState().media.highContrast).toBeTrue();
		});
	});

	describe('when auth state change', () => {
		it('updates the auth button', async () => {
			const element = await setup();
			const signedInButton = element.shadowRoot.querySelector('#authButton');

			expect(signedInButton.querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_login');
			expect(signedInButton.classList.contains('logout')).toBeFalse();

			setSignedIn();

			expect(signedInButton.querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_logout');
			expect(signedInButton.classList.contains('logout')).toBeTrue();

			setSignedOut();

			expect(signedInButton.querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_login');
			expect(signedInButton.classList.contains('logout')).toBeFalse();
		});
	});

	describe('when signIn button is clicked', () => {
		it('calls the AuthService', async () => {
			const authServiceSpy = spyOn(authService, 'signIn');
			const element = await setup();
			const signedInButton = element.shadowRoot.querySelector('#authButton');

			signedInButton.click();

			expect(authServiceSpy).toHaveBeenCalled();
		});
	});

	describe('when signOut button is clicked', () => {
		it('calls the AuthService', async () => {
			const authServiceSpy = spyOn(authService, 'signOut');
			const element = await setup({ auth: { signedIn: true } });
			const signedInButton = element.shadowRoot.querySelector('#authButton');

			signedInButton.click();

			expect(authServiceSpy).toHaveBeenCalled();
		});
	});
});
