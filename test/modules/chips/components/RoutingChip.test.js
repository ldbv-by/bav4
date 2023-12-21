import { RoutingChip } from '../../../../src/modules/chips/components/assistChips/RoutingChip';
import { CoordinateProposalType, RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
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

	const setup = async (properties = {}, attributes = {}) => {
		store = TestUtils.setupStoreAndDi(defaultRoutingState, { routing: routingReducer });
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
			const element = await setup(properties);

			expect(element.isVisible()).toBeTrue();
		});

		it('renders the view without coordinate', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeTrue();
		});
	});

	describe('when chip is clicked', () => {
		it('changes to START_OR_DESTINATION proposal coordinate on click', async () => {
			const properties = { coordinate: coordinate };
			const element = await setup(properties);
			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(store.getState().routing.proposal.payload).toEqual({
				coord: coordinate,
				type: CoordinateProposalType.START_OR_DESTINATION
			});
		});
	});
});
