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
});
