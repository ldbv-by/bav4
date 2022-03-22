import { FirstSteps, FIRST_STEPS_NOTIFICATION_DELAY_TIME } from '../../../../src/modules/help/components/FirstSteps';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { render } from 'lit-html';
import { QueryParameters } from '../../../../src/services/domain/queryParameters';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';


window.customElements.define(FirstSteps.tag, FirstSteps);


describe('Help', () => {
	let store;

	const configServiceMock = { hasKey: () => true, getValue: () => 'http://some.url' };
	const setup = (state = {}, config = {}) => {
		const { embed = false, urlParams = new URLSearchParams() } = config;

		const initialState = {
			mainMenu: {
				open: true
			},
			notifications: {
				latest: null
			},
			media: {
				portrait: false,
				minWidth: true
			},
			modal: {
				data: null
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, { mainMenu: createNoInitialStateMainMenuReducer(), media: createNoInitialStateMediaReducer(), notifications: notificationReducer, modal: modalReducer });
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed,
			getUrlParams: () => urlParams
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		$injector.registerSingleton('ConfigService', configServiceMock);

		return TestUtils.render(FirstSteps.tag);
	};

	describe('when initialized', () => {
		beforeEach(async () => {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('updates the model with env-values', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			const spy = spyOn(configServiceMock, 'getValue').and.callThrough();
			const element = await setup(state, {});
			const model = element.getModel();

			// calling configService for a value for the key and provide a default-value(null)
			expect(spy).toHaveBeenCalledWith('FIRST_STEPS_CONTENT_URL', null);
			expect(model.firstStepsContentSource).toBe('http://some.url');
		});


		it('renders Help buttons', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.first_steps__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.first_steps__button')).display).toBe('flex');
		});

		describe('when help-button is clicked', () => {
			it('opens the modal with the available help-content', async () => {
				const state = {
					media: {
						portrait: false
					}
				};
				const element = await setup(state, {});
				const clickableHelpButtonText = element.shadowRoot.querySelector('.first_steps__button-text');
				clickableHelpButtonText.click();

				expect(store.getState().modal.data.title).toBe('help_firstSteps_notification_first_steps');
				//we expect a lit-html TemplateResult as content
				expect(store.getState().modal.data.content.strings[0]).toBe('<iframe title=');
				expect(store.getState().modal.data.content.values[1]).toBe('http://some.url');
			});

			it('opens the modal with showcase, when help-content is NOT available', async () => {
				const state = {
					media: {
						portrait: false
					}
				};
				spyOn(configServiceMock, 'getValue').and.callFake(() => null);
				const element = await setup(state, {});
				const clickableHelpButtonText = element.shadowRoot.querySelector('.first_steps__button-text');
				clickableHelpButtonText.click();

				expect(store.getState().modal.data.title).toBe('Showcase');
				//we expect a lit-html TemplateResult as content
				expect(store.getState().modal.data.content.strings[0]).toBe('<ba-showcase>');
			});


		});

		it('emits a notification', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state, {});
			expect(store.getState().notifications.latest).toBeNull();
			jasmine.clock().tick(3100);

			expect(element).toBeTruthy();
			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();
		});

		it('emits a notification with a close-Button', async () => {
			const target = document.createElement('div');
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state, {});
			jasmine.clock().tick(FIRST_STEPS_NOTIFICATION_DELAY_TIME + 100);

			expect(element).toBeTruthy();
			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();

			const notificationContent = store.getState().notifications.latest.payload.content;
			render(notificationContent, target);
			const closeButtonElement = target.querySelector('#closeButton');
			closeButtonElement.click();

			expect(store.getState().notifications.latest.payload.content).toBeNull();
		});

		it('emits a notification with a open-Button', async () => {
			const target = document.createElement('div');
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state, {});
			jasmine.clock().tick(FIRST_STEPS_NOTIFICATION_DELAY_TIME + 100);

			expect(element).toBeTruthy();
			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();

			const notificationContent = store.getState().notifications.latest.payload.content;
			render(notificationContent, target);

			const openButtonElement = target.querySelector('#firstSteps');
			expect(openButtonElement.label).toBe('help_firstSteps_notification_first_steps');
			openButtonElement.click();

			expect(store.getState().notifications.latest.payload.content).toBeNull();
		});

		describe('when a notification with a open-Button is emitted', () => {
			describe('and when the open-button is clicked', () => {
				it('opens the modal with the helpcontent', async () => {
					const target = document.createElement('div');
					const state = {
						media: {
							portrait: true
						}
					};

					const element = await setup(state, {});
					jasmine.clock().tick(FIRST_STEPS_NOTIFICATION_DELAY_TIME + 100);

					expect(element).toBeTruthy();
					expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();

					const notificationContent = store.getState().notifications.latest.payload.content;
					render(notificationContent, target);

					const openButtonElement = target.querySelector('#firstSteps');
					expect(openButtonElement.label).toBe('help_firstSteps_notification_first_steps');
					openButtonElement.click();

					expect(store.getState().notifications.latest.payload.content).toBeNull();
					expect(store.getState().modal.data.title).toBe('help_firstSteps_notification_first_steps');
					//we expect a lit-html TemplateResult as content
					expect(store.getState().modal.data.content.strings[0]).toBe('<iframe title=');
				});

			});
		});

		it('supress a notification, when urlParameter \'T_DISABLE_INITIAL_UI_HINTS\' is active ', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			const element = await setup(state, { urlParams: new URLSearchParams(`?${QueryParameters.T_DISABLE_INITIAL_UI_HINTS}=true`) });
			jasmine.clock().tick(FIRST_STEPS_NOTIFICATION_DELAY_TIME + 100);

			expect(element).toBeTruthy();
			expect(store.getState().notifications.latest).toBeNull();
		});

		it('supress a notification, when help-content is not available', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			spyOn(configServiceMock, 'getValue').and.callFake(() => null);
			const element = await setup(state, {});
			jasmine.clock().tick(FIRST_STEPS_NOTIFICATION_DELAY_TIME + 100);

			expect(element).toBeTruthy();
			expect(store.getState().notifications.latest).toBeNull();
		});

		it('supress a notification, when help-content is not a valid URL', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			spyOn(configServiceMock, 'getValue').and.callFake(() => 'some');
			const element = await setup(state, {});
			jasmine.clock().tick(FIRST_STEPS_NOTIFICATION_DELAY_TIME + 100);

			expect(element).toBeTruthy();
			expect(store.getState().notifications.latest).toBeNull();
		});

		it('does not supress a notification, when urlParameter \'T_DISABLE_INITIAL_UI_HINTS\' have invalid value ', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state, { urlParams: new URLSearchParams(`?${QueryParameters.T_DISABLE_INITIAL_UI_HINTS}=foo`) });
			jasmine.clock().tick(FIRST_STEPS_NOTIFICATION_DELAY_TIME + 100);

			expect(element).toBeTruthy();
			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();
		});
	});

	describe('responsive layout ', () => {

		it('renders for landscape mode', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.first_steps__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.first_steps__button')).display).toBe('flex');
		});

		it('renders for portrait mode', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.first_steps__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.first_steps__button')).display).toBe('none');
		});

		it('renders for desktop mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.first_steps__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.first_steps__button')).display).toBe('flex');
		});

		it('renders for tablet mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.first_steps__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.first_steps__button')).display).toBe('flex');
		});

		it('renders with open main menu for landscape mode', async () => {
			const state = {
				mainMenu: {
					open: true
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);
		});

		it('renders with closed main menu for landscape mode', async () => {
			const state = {
				mainMenu: {
					open: false
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);
		});
	});
});
