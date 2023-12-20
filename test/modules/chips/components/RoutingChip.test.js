import { RoutingChip } from '../../../../src/modules/chips/components/assistChips/RoutingChip';
import { CoordinateProposalType, RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { setStatus } from '../../../../src/store/routing/routing.action';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import routingSvg from '../../../../src/modules/chips/components/assistChips/assets/direction.svg';
import { TestUtils } from '../../../test-utils';
import { Tools } from '../../../../src/domain/tools';
import { toolsReducer } from '../../../../src/store/tools/tools.reducer';

window.customElements.define(RoutingChip.tag, RoutingChip);

describe('RoutingChip', () => {
	let store;
	const defaultRoutingState = {
		routing: {
			status: RoutingStatusCodes.Start_Destination_Missing,
			categoryId: 'bike'
		}
	};

	const setup = async (state = defaultRoutingState, properties = {}, attributes = {}) => {
		store = TestUtils.setupStoreAndDi(state, { routing: routingReducer, tools: toolsReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		const element = await TestUtils.render(RoutingChip.tag, properties, attributes);

		return element;
	};

	const coordinate = [42, 21];

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RoutingChip().getModel();

			expect(model).toEqual({ status: null, coordinate: [] });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('chips_assist_chip_start_routing_here');
			expect(element.getIcon()).toBe(routingSvg);
		});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup();

			const { status, coordinate } = element.getModel();

			expect(status).toEqual(RoutingStatusCodes.Start_Destination_Missing);
			expect(coordinate).toEqual([]);
		});

		it('renders the view', async () => {
			const state = { routing: { status: RoutingStatusCodes.Start_Destination_Missing } };
			const properties = { coordinate: coordinate };
			const element = await setup(state, properties);

			expect(element.isVisible()).toBeTrue();
		});

		it('renders the view without coordinate', async () => {
			const state = { routing: { status: RoutingStatusCodes.Start_Destination_Missing } };
			const properties = {};
			const element = await setup(state, properties);

			expect(element.isVisible()).toBeTrue();
		});

		it('renders the view without status', async () => {
			const state = { routing: { status: RoutingStatusCodes.Destination_Missing } };
			const properties = { coordinate: coordinate };
			const element = await setup(state, properties);

			expect(element.isVisible()).toBeTrue();
		});
	});

	describe('when chip is clicked', () => {
		it('changes to START_OR_DESTINATION proposal coordinate on click', async () => {
			const state = { routing: { status: RoutingStatusCodes.Start_Destination_Missing } };

			const properties = { coordinate: coordinate };
			const element = await setup(state, properties);
			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(store.getState().routing.proposal.payload).toEqual({
				coord: coordinate,
				type: CoordinateProposalType.START_OR_DESTINATION
			});
		});

		it('changes to INTERMEDIATE proposal coordinate on click', async () => {
			const state = {
				routing: {
					waypoints: [
						[0, 0],
						[1, 1]
					],
					status: RoutingStatusCodes.Ok
				}
			};

			const properties = { coordinate: coordinate };
			const element = await setup(state, properties);

			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(store.getState().tools.current).toBe(Tools.ROUTING);
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			const element = await setup();
			const unsubscribeSpy = spyOn(element, '_unsubscribeFromStore').and.callThrough();

			element.onDisconnect(); // we call onDisconnect manually

			expect(unsubscribeSpy).toHaveBeenCalled();
		});
	});
});
