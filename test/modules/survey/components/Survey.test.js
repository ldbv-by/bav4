import { Survey } from '../../../../src/modules/survey/components/Survey';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';


window.customElements.define(Survey.tag, Survey);


describe('Survey', () => {

	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;

		const initialState = {
			mainMenu: {
				open: true
			},
			media: {
				portrait: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, { mainMenu: createNoInitialStateMainMenuReducer(), media: createNoInitialStateMediaReducer() });
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(Survey.tag);
	};

	describe('when initialized', () => {

		it('adds survey for landscape mode', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.survey__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.survey__button')).display).toBe('flex');
		});

		it('adds survey for portrait mode', async () => {
			const state = {
				media: {
					portrait: true
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.survey__button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.survey__button')).display).toBe('none');
		});

	});



	describe('responsive layout ', () => {

		it('layouts with open main menu for landscape mode', async () => {
			const state = {
				mainMenu: {
					open: true
				}
			};
			const element = await setup(state, {});
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);
		});

		it('layouts with open main menu for landscape mode', async () => {
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
