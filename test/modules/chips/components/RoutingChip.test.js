import { RoutingChip } from '../../../../src/modules/chips/components/assistChips/RoutingChip';
import { CoordinateProposalType, RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import routingSvg from '../../../../src/modules/chips/components/assistChips/assets/direction.svg';
import { TestUtils } from '../../../test-utils';

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
		store = TestUtils.setupStoreAndDi(state, { routing: routingReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		const element = await TestUtils.render(RoutingChip.tag, properties, attributes);

		return element;
	};

	const coordinate = [42, 21];

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RoutingChip().getModel();

			expect(model).toEqual({ coordinate: [] });
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

			const { coordinate } = element.getModel();

			expect(coordinate).toEqual([]);
		});

		it('renders the view', async () => {
			const properties = { coordinate: coordinate };
			const element = await setup(defaultRoutingState, properties);

			expect(element.isVisible()).toBeTrue();
		});

		it('renders the view without coordinate', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeTrue();
		});
	});

	describe('when chip is clicked', () => {
		it('resets s-o-s routing', async () => {
			const properties = { coordinate: coordinate };
			const state = {
				routing: {
					status: RoutingStatusCodes.Start_Missing,
					categoryId: 'bike',
					route: {},
					waypoints: [[]]
				}
			};
			const element = await setup(state, properties);
			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(store.getState().routing).toEqual(
				jasmine.objectContaining({ waypoints: [], route: null, status: RoutingStatusCodes.Start_Destination_Missing })
			);
		});

		it('changes to START_OR_DESTINATION proposal coordinate on click', async () => {
			const properties = { coordinate: coordinate };
			const element = await setup(defaultRoutingState, properties);
			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(store.getState().routing.proposal.payload).toEqual({
				coord: coordinate,
				type: CoordinateProposalType.START_OR_DESTINATION
			});
		});
	});
});
