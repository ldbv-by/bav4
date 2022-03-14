import { Survey, SURVEY_NOTIFICATION_DELAY_TIME } from '../../../../src/modules/survey/components/Survey';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { render } from 'lit-html';
import { QueryParameters } from '../../../../src/services/domain/queryParameters';


window.customElements.define(Survey.tag, Survey);


describe('Survey', () => {
	let store;
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
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, { mainMenu: createNoInitialStateMainMenuReducer(), media: createNoInitialStateMediaReducer(), notifications: notificationReducer });
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed,
			getUrlParams: () => urlParams
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(Survey.tag);
	};

	describe('when initialized', () => {
		beforeEach(async () => {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('renders Survey buttons', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.survey__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.survey__button')).display).toBe('flex');
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

		it('emits a notification with a close-Button and a open-Button', async () => {
			const target = document.createElement('div');
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state, {});
			jasmine.clock().tick(SURVEY_NOTIFICATION_DELAY_TIME + 100);

			expect(element).toBeTruthy();
			expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();

			const notificationContent = store.getState().notifications.latest.payload.content;
			render(notificationContent, target);
			const closeButtonElement = target.querySelector('#closeButton');
			const openButtonElement = target.querySelector('.survey__notification-link');
			expect(openButtonElement.innerText).toBe('survey_notification_open');
			closeButtonElement.click();

			expect(store.getState().notifications.latest.payload.content).toBeNull();
		});


		it('supress a notification, when urlParameter \'T_DISABLE_INITIAL_UI_HINTS\' is active ', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			const element = await setup(state, { urlParams: new URLSearchParams(`?${QueryParameters.T_DISABLE_INITIAL_UI_HINTS}=true`) });
			jasmine.clock().tick(SURVEY_NOTIFICATION_DELAY_TIME + 100);

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
			jasmine.clock().tick(SURVEY_NOTIFICATION_DELAY_TIME + 100);

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
			expect(element.shadowRoot.querySelectorAll('.survey__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.survey__button')).display).toBe('flex');
		});

		it('renders for portrait mode', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.survey__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.survey__button')).display).toBe('none');
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
			expect(element.shadowRoot.querySelectorAll('.survey__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.survey__button')).display).toBe('flex');
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
			expect(element.shadowRoot.querySelectorAll('.survey__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.survey__button')).display).toBe('flex');
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
