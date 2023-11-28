import { $injector } from '../../../../../../src/injection';
import { AbstractMvuContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { RoutingPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/routing/RoutingPanel';
import { routingReducer } from '../../../../../../src/store/routing/routing.reducer';
import { toolsReducer } from '../../../../../../src/store/tools/tools.reducer';
import { TestUtils } from '../../../../../test-utils';
import { Tools } from '../../../../../../src/domain/tools.js';

window.customElements.define(RoutingPanel.tag, RoutingPanel);

describe('RoutingPanel', () => {
	let store;
	const setup = (state) => {
		const initialState = {
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			tools: toolsReducer,
			routing: routingReducer
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

			expect(model).toEqual({ active: false });
		});
	});

	describe('when initialized', () => {
		it('does NOT renders the routing components', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-container')).toHaveSize(0);
		});

		describe('when component is activated as AbstractMvuContentPanel', () => {
			it('renders the routing components', async () => {
				const element = await setup();
				element.setActive(true);
				const container = element.shadowRoot.querySelectorAll('.container');

				expect(container).toHaveSize(1);

				// lazy loading component with the routing content
				const lazyLoadElement = element.shadowRoot.querySelector('ba-lazy-load');
				expect(lazyLoadElement).toBeTruthy();
				expect(lazyLoadElement.content.strings[0].includes('<ba-routing-container')).toBeTrue();
				expect(element.shadowRoot.querySelectorAll('ba-profile-chip')).toHaveSize(1);
			});
		});
	});

	describe('when close icon is clicked', () => {
		it('updates the "tools" s-o-s', async () => {
			const element = await setup({
				tools: {
					current: Tools.ROUTING
				}
			});

			const closeIcon = element.shadowRoot.querySelector('ba-icon');

			closeIcon.click();

			expect(store.getState().tools.current).toBeNull();
		});
	});
});
