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
	let store;
	const setup = (state, properties) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
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
		const defaultRoutingState = {
			routing: {
				status: RoutingStatusCodes.Ok,
				waypoints: [
					[0, 0],
					[1, 1],
					[2, 2]
				]
			}
		};
		it('renders three waypoints', async () => {
			const element = await setup(defaultRoutingState);

			const waypointElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
			expect(waypointElements).toHaveSize(3);
		});

		it('renders three plus one surrounding placeholders', async () => {
			const element = await setup(defaultRoutingState);

			const placeholderElements = element.shadowRoot.querySelectorAll('.placeholder');
			expect(placeholderElements).toHaveSize(4); // Surrounding placeholders should be n +1
		});

		it('renders a title', async () => {
			const element = await setup(defaultRoutingState);

			expect(element.shadowRoot.querySelector('.title').innerText).toBe('routing_waypoints_title');
		});

		it('renders action-buttons', async () => {
			const element = await setup(defaultRoutingState);

			const buttonElements = element.shadowRoot.querySelectorAll('ba-button');

			expect(buttonElements).toHaveSize(2);
			expect(buttonElements[0].label).toBe('routing_waypoints_remove_all');
			expect(buttonElements[1].label).toBe('routing_waypoints_reverse');
		});

		describe('when action-button is pressed', () => {
			it('removes all waypoints', async () => {
				const element = await setup(defaultRoutingState);

				const actionButtonElement = element.shadowRoot.querySelector('#button_remove_all');

				actionButtonElement.click();

				expect(store.getState().routing.waypoints).toEqual([]);
			});

			it('reverse to order of all waypoints', async () => {
				const element = await setup(defaultRoutingState);

				const actionButtonElement = element.shadowRoot.querySelector('#button_reverse');
				expect(store.getState().routing.waypoints).toEqual([
					[0, 0],
					[1, 1],
					[2, 2]
				]);

				actionButtonElement.click();

				expect(store.getState().routing.waypoints).toEqual([
					[2, 2],
					[1, 1],
					[0, 0]
				]);
			});
		});
	});
});
