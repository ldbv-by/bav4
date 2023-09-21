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
		it('renders three waypoints whit action buttons', async () => {
			const element = await setup(defaultRoutingState);
			element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
			expect(element.shadowRoot.querySelectorAll('ba-routing-waypoint-item')).toHaveSize(3);

			// waypoint action buttons
			expect(element.shadowRoot.querySelectorAll('#increase')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('#decrease')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('#remove')).toHaveSize(3);
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

		describe('when single waypoint action-button is pressed', () => {
			describe('and a waypoint should be removed', () => {
				it('removes the first waypoint', async () => {
					const element = await setup(defaultRoutingState);

					const actionButtonElements = element.shadowRoot.querySelectorAll('#remove');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					actionButtonElements[0].click();

					expect(store.getState().routing.waypoints).toEqual([
						[1, 1],
						[2, 2]
					]);
				});

				it('removes the waypoint in the middle', async () => {
					const element = await setup(defaultRoutingState);

					const actionButtonElements = element.shadowRoot.querySelectorAll('#remove');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					actionButtonElements[1].click();

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[2, 2]
					]);
				});

				it('removes the last waypoint', async () => {
					const element = await setup(defaultRoutingState);

					const actionButtonElements = element.shadowRoot.querySelectorAll('#remove');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					actionButtonElements[2].click();

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1]
					]);
				});
			});

			describe('and a waypoint should be moved', () => {
				it('moves the first waypoint forward', async () => {
					const element = await setup(defaultRoutingState);

					const actionButtonElements = element.shadowRoot.querySelectorAll('#increase');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					actionButtonElements[0].click();

					expect(store.getState().routing.waypoints).toEqual([
						[1, 1],
						[0, 0],
						[2, 2]
					]);
				});

				it('does NOT moves the first waypoint backward', async () => {
					const element = await setup(defaultRoutingState);

					const actionButtonElements = element.shadowRoot.querySelectorAll('#decrease');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					actionButtonElements[0].click();

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);
				});

				it('does NOT moves the last waypoint forward', async () => {
					const element = await setup(defaultRoutingState);

					const actionButtonElements = element.shadowRoot.querySelectorAll('#increase');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					actionButtonElements[2].click();

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);
				});

				it('moves the last waypoint backward', async () => {
					const element = await setup(defaultRoutingState);

					const actionButtonElements = element.shadowRoot.querySelectorAll('#decrease');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					actionButtonElements[2].click();

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[2, 2],
						[1, 1]
					]);
				});
			});
		});
	});
});
