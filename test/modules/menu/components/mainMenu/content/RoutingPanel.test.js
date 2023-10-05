import { $injector } from '../../../../../../src/injection';
import { AbstractMvuContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { RoutingPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/routing/RoutingPanel';
import { createNoInitialStateMediaReducer } from '../../../../../../src/store/media/media.reducer';
import { TestUtils } from '../../../../../test-utils';

window.customElements.define(RoutingPanel.tag, RoutingPanel);

describe('RoutingPanel', () => {
	const setup = (state) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(RoutingPanel.tag);
	};

	describe('class', () => {
		it('inherits from AbstractMvuContentPanel', async () => {
			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RoutingPanel().getModel();

			expect(model).toEqual({});
		});
	});

	describe('when initialized', () => {
		it('renders a category bar', async () => {
			const element = await setup();

			const container = element.shadowRoot.querySelectorAll('.container');
			const categoryBar = element.shadowRoot.querySelectorAll('ba-routing-category-bar');

			expect(container).toHaveSize(1);
			expect(categoryBar).toHaveSize(1);
		});
	});
});
