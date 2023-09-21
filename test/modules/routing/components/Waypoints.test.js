import { RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { Waypoints } from '../../../../src/modules/routing/components/waypoints/Waypoints';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';
window.customElements.define(Waypoints.tag, Waypoints);

describe('Waypoints', () => {
	const environmentService = {
		isTouch: () => false
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
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('EnvironmentService', environmentService);

		return TestUtils.render(Waypoints.tag, properties);
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
			const model = new Waypoints().getModel();

			expect(model).toEqual({
				status: 900,
				waypoints: [],
				draggedItem: false,
				collapsedWaypoints: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('renders three waypoints', async () => {
			const routingState = {
				routing: {
					status: RoutingStatusCodes.Ok,
					waypoints: [
						[0, 0],
						[1, 1],
						[2, 2]
					]
				}
			};
			const element = await setup(routingState);

			const waypointElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
			expect(waypointElements).toHaveSize(3);
		});
	});
});
