import { RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { RoutingInfo } from '../../../../src/modules/routing/components/routingInfo/RoutingInfo';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(RoutingInfo.tag, RoutingInfo);
describe('RoutingInfo', () => {
	const etaCalculatorServiceMock = {
		getETACalculatorFor: () => {
			return { getETAfor: () => 42000 };
		}
	};

	const setup = (state, properties) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer(),
			routing: routingReducer
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ETACalculatorService', etaCalculatorServiceMock);

		return TestUtils.render(RoutingInfo.tag, properties);
	};

	describe('class', () => {
		it('inherits from MvuElement', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RoutingInfo().getModel();

			expect(model).toEqual({
				status: 900,
				stats: null,
				categoryId: null
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toHaveSize(0);
		});

		it('renders RouteInfo', async () => {
			const state = {
				routing: {
					status: RoutingStatusCodes.Ok,
					stats: {
						twoDiff: [111, 222],
						dist: 333,
						time: 3600000
					},
					categoryId: 'bike'
				}
			};
			const element = await setup(state);

			const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

			expect(routingElements).toHaveSize(4);
			expect(routingElements[0].innerText).toBe('< 1 min.');
			expect(routingElements[1].innerText).toBe('0.33 km');
			expect(routingElements[2].innerText).toBe('111 m');
			expect(routingElements[3].innerText).toBe('222 m');
		});
	});
});
