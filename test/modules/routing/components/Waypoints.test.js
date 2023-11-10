import { RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { Waypoints } from '../../../../src/modules/routing/components/waypoints/Waypoints';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';
window.customElements.define(Waypoints.tag, Waypoints);

describe('Waypoints', () => {
	const environmentServiceMock = {
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
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('EnvironmentService', environmentServiceMock);

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
				status: null,
				waypoints: [],
				draggedItem: null
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

		const twoPointRoutingState = {
			routing: {
				status: RoutingStatusCodes.Ok,
				waypoints: [
					[0, 0],
					[1, 1]
				]
			}
		};

		it('renders three waypoints', async () => {
			const element = await setup(defaultRoutingState);
			element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
			expect(element.shadowRoot.querySelectorAll('ba-routing-waypoint-item')).toHaveSize(3);
		});

		it('renders three plus one surrounding placeholders', async () => {
			const element = await setup(defaultRoutingState);

			const placeholderElements = element.shadowRoot.querySelectorAll('.placeholder');
			expect(placeholderElements).toHaveSize(4); // Surrounding placeholders should be n +1
		});

		it('renders action-button', async () => {
			const element = await setup(defaultRoutingState);

			const reverseIcon = element.shadowRoot.querySelector('#button_reverse');

			expect(reverseIcon).toBeDefined();
			expect(reverseIcon.title).toBe('routing_waypoints_reverse');
		});

		it('renders draggable elements', async () => {
			// HINT: the existence of the behavior (user can drag an element) is additionally driven by css-classes specified in main.css and baElement.css.
			// All elements are not draggable by default, but can be activated with the 'draggable' class.
			const draggableClass = 'draggable';
			const element = await setup(defaultRoutingState);
			const listElements = element.shadowRoot.querySelectorAll('li');
			expect(listElements.length).toBe(7);
			expect([...listElements].every((element) => element.classList.contains(draggableClass))).toBeTrue();
		});

		it('have only non-draggable placeholder items', async () => {
			const element = await setup(defaultRoutingState);
			const placeholderElements = [...element.shadowRoot.querySelectorAll('.placeholder')];

			const nonDraggablePlaceholderElements = placeholderElements.filter((element) => {
				return !element.draggable;
			});

			expect(placeholderElements.length).toBe(4);
			expect(nonDraggablePlaceholderElements.length).toBe(4);
		});

		describe('when action-button is pressed', () => {
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
			const createWaypointEvent = (eventType, waypoint) => {
				return new CustomEvent(eventType, { detail: { waypoint: waypoint } });
			};
			describe('and a waypoint should be removed', () => {
				it('removes the first waypoint', async () => {
					const element = await setup(defaultRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					waypointItemElements[0].dispatchEvent(createWaypointEvent('remove', waypointItemElements[0].waypoint));

					expect(store.getState().routing.waypoints).toEqual([
						[1, 1],
						[2, 2]
					]);
				});

				it('removes the first waypoint (out of two)', async () => {
					const element = await setup(twoPointRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1]
					]);

					waypointItemElements[0].dispatchEvent(createWaypointEvent('remove', waypointItemElements[0].waypoint));
					expect(store.getState().routing.waypoints).toEqual([[1, 1]]);
					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Start_Missing);
				});

				it('removes the waypoint in the middle', async () => {
					const element = await setup(defaultRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					waypointItemElements[1].dispatchEvent(createWaypointEvent('remove', waypointItemElements[1].waypoint));

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[2, 2]
					]);
				});

				it('removes the last waypoint', async () => {
					const element = await setup(defaultRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					waypointItemElements[2].dispatchEvent(createWaypointEvent('remove', waypointItemElements[2].waypoint));

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1]
					]);
				});

				it('removes the last waypoint (out of two)', async () => {
					const element = await setup(twoPointRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1]
					]);

					waypointItemElements[0].dispatchEvent(createWaypointEvent('remove', waypointItemElements[1].waypoint));

					expect(store.getState().routing.waypoints).toEqual([[0, 0]]);
					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Destination_Missing);
				});
			});

			describe('and a waypoint should be moved', () => {
				it('moves the first waypoint forward', async () => {
					const element = await setup(defaultRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					waypointItemElements[0].dispatchEvent(createWaypointEvent('increase', waypointItemElements[0].waypoint));

					expect(store.getState().routing.waypoints).toEqual([
						[1, 1],
						[0, 0],
						[2, 2]
					]);
				});

				it('does NOT moves the first waypoint backward', async () => {
					const element = await setup(defaultRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					waypointItemElements[0].dispatchEvent(createWaypointEvent('decrease', waypointItemElements[0].waypoint));

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);
				});

				it('does NOT moves the last waypoint forward', async () => {
					const element = await setup(defaultRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					waypointItemElements[2].dispatchEvent(createWaypointEvent('increase', waypointItemElements[2].waypoint));

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);
				});

				it('moves the last waypoint backward', async () => {
					const element = await setup(defaultRoutingState);
					const waypointItemElements = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1],
						[2, 2]
					]);

					waypointItemElements[2].dispatchEvent(createWaypointEvent('decrease', waypointItemElements[2].waypoint));

					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[2, 2],
						[1, 1]
					]);
				});
			});
		});

		describe('when waypoint items dragged', () => {
			let element;
			beforeEach(async () => {
				element = await setup(defaultRoutingState);
			});
			const createNewDataTransfer = () => {
				let data = {};
				return {
					clearData: function (key) {
						if (key === undefined) {
							data = {};
						} else {
							delete data[key];
						}
					},
					getData: function (key) {
						return data[key];
					},
					setData: function (key, value) {
						data[key] = value;
					},
					setDragImage: function () {},
					dropEffect: 'none',
					files: [],
					items: [],
					types: []
					// also effectAllowed
				};
			};

			it('on dragstart should abort on touch-devices', () => {
				const waypointElement = element.shadowRoot.querySelector('.waypoint');
				spyOn(environmentServiceMock, 'isTouch').and.callFake(() => true);
				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, waypointElement);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				waypointElement.dispatchEvent(dragstartEvt);

				expect(element.getModel().draggedItem).toBeNull();
			});

			it('on dragstart should update internal draggedItem', () => {
				const waypointElement = element.shadowRoot.querySelectorAll('.waypoint')[1];

				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, waypointElement);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				waypointElement.dispatchEvent(dragstartEvt);

				expect(element.getModel().draggedItem).not.toBeFalse();
			});

			it('on dragstart should update placeholder-content for dragging 1st waypoint', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[0];

				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, waypointElement);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				waypointElement.dispatchEvent(dragstartEvt);

				const placeholders = [...element.shadowRoot.querySelectorAll('.placeholder')];
				const activePlaceholders = [...element.shadowRoot.querySelectorAll('.placeholder-active')];

				expect(placeholders.length).toBe(4);
				expect(activePlaceholders.length).toBe(2);

				expect(activePlaceholders[0].innerText).toBe('2');
				expect(activePlaceholders[1].innerText).toBe('3 - routing_waypoints_as_destination');
			});

			it('on dragstart should update placeholder-content for dragging 2th waypoint', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[1];

				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, waypointElement);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				waypointElement.dispatchEvent(dragstartEvt);

				const placeholders = [...element.shadowRoot.querySelectorAll('.placeholder')];
				const activePlaceholders = [...element.shadowRoot.querySelectorAll('.placeholder-active')];
				expect(placeholders.length).toBe(4);
				expect(activePlaceholders.length).toBe(2);
				expect(activePlaceholders[0].innerText).toBe('1 - routing_waypoints_as_start');
				expect(activePlaceholders[1].innerText).toBe('3 - routing_waypoints_as_destination');
			});

			it('on dragstart should update placeholder-content for dragging 3th waypoint', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[2];

				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, waypointElement);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				waypointElement.dispatchEvent(dragstartEvt);

				const placeholders = [...element.shadowRoot.querySelectorAll('.placeholder')];
				const activePlaceholders = [...element.shadowRoot.querySelectorAll('.placeholder-active')];
				expect(placeholders.length).toBe(4);
				expect(activePlaceholders.length).toBe(2);
				expect(activePlaceholders[0].innerText).toBe('1 - routing_waypoints_as_start');
				expect(activePlaceholders[1].innerText).toBe('2');
			});

			it('does NOT add style on dragEnter of neighboring placeholder', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[0];
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_0');

				element.signal('update_dragged_item', waypointElement.waypoint);
				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragenter', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				neighborPlaceholder.dispatchEvent(dragstartEvt);

				expect(neighborPlaceholder.classList.contains('over')).toBeFalse();
			});

			it('add style class on dragEnter of not neighboring placeholder', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[0];
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_4');

				element.signal('update_dragged_item', waypointElement.waypoint);
				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragenter', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				neighborPlaceholder.dispatchEvent(dragstartEvt);

				expect(neighborPlaceholder.classList.contains('over')).toBeTrue();
			});

			it('does not add style class on dragEnter of unknown element ', () => {
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_4');

				element.signal('update_dragged_item', null);
				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragenter', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dragstartEvt.dataTransfer = createNewDataTransfer();
				neighborPlaceholder.dispatchEvent(dragstartEvt);

				expect(neighborPlaceholder.classList.contains('over')).toBeFalse();
			});

			it('on dragEnd call event.preventDefault()', () => {
				const listElement = element.shadowRoot.querySelector('li');

				const dragendEvt = document.createEvent('MouseEvents');
				dragendEvt.initMouseEvent('dragend', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, listElement);
				dragendEvt.dataTransfer = createNewDataTransfer();
				dragendEvt.preventDefault = jasmine.createSpy();
				listElement.dispatchEvent(dragendEvt);

				expect(dragendEvt.preventDefault).toHaveBeenCalled();
			});

			it('on dragleave of not neighboring placeholder remove style class', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[0];
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_4');
				element.signal('update_dragged_item', waypointElement.waypoint);
				const dragstartEvt = document.createEvent('MouseEvents');
				dragstartEvt.initMouseEvent('dragleave', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dragstartEvt.dataTransfer = createNewDataTransfer();

				neighborPlaceholder.classList.add('over');
				neighborPlaceholder.dispatchEvent(dragstartEvt);

				expect(neighborPlaceholder.classList.contains('over')).toBeFalse();
			});

			it("on dragover of not neighboring placeholder dropEffect to 'all'", () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[0];
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_4');
				element.signal('update_dragged_item', waypointElement.waypoint);
				const dragoverEvt = document.createEvent('MouseEvents');
				dragoverEvt.initMouseEvent('dragover', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dragoverEvt.dataTransfer = createNewDataTransfer();

				neighborPlaceholder.dispatchEvent(dragoverEvt);

				expect(dragoverEvt.dataTransfer.dropEffect).toBe('all');
			});

			it("on dragover of not neighboring placeholder dropEffect to 'none'", () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[0];
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_2');
				element.signal('update_dragged_item', waypointElement.waypoint);
				const dragoverEvt = document.createEvent('MouseEvents');
				dragoverEvt.initMouseEvent('dragover', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dragoverEvt.dataTransfer = createNewDataTransfer();
				dragoverEvt.dataTransfer.dropEffect = 'foo';
				neighborPlaceholder.dispatchEvent(dragoverEvt);

				expect(dragoverEvt.dataTransfer.dropEffect).toBe('none');
			});

			it("on dragover of unknown element (null) dropEffect to 'none'", () => {
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_2');
				element.signal('update_dragged_item', null);
				const dragoverEvt = document.createEvent('MouseEvents');
				dragoverEvt.initMouseEvent('dragover', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dragoverEvt.dataTransfer = createNewDataTransfer();
				dragoverEvt.dataTransfer.dropEffect = 'foo';
				neighborPlaceholder.dispatchEvent(dragoverEvt);

				expect(dragoverEvt.dataTransfer.dropEffect).toBe('none');
			});

			it('drops first waypoint on placeholder to be penultimate waypoint', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[0];
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_4');
				element.signal('update_dragged_item', waypointElement.waypoint);
				expect(element.getModel().draggedItem.index).toBe(0);
				const dropEvt = document.createEvent('MouseEvents');
				dropEvt.initMouseEvent('drop', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dropEvt.dataTransfer = createNewDataTransfer();

				/*
				 *  0     0    1     1    2     2     3
				 * [p0] [id0] [p2] [id1] [p4] [id2] [p5]
				 *        |_______________^
				 */

				neighborPlaceholder.classList.add('over');
				neighborPlaceholder.dispatchEvent(dropEvt);

				expect(store.getState().routing.waypoints[0]).toEqual([1, 1]);
				expect(store.getState().routing.waypoints[1]).toEqual([0, 0]);
				expect(store.getState().routing.waypoints[2]).toEqual([2, 2]);
				expect(neighborPlaceholder.classList.contains('over')).toBeFalse();
			});

			it('drops last on placeholder to be penultimate waypoint', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const waypointElement = waypoints[2];
				const neighborPlaceholder = element.shadowRoot.querySelector('#placeholder_2');
				element.signal('update_dragged_item', waypointElement.waypoint);
				expect(element.getModel().draggedItem.index).toBe(2);
				const dropEvt = document.createEvent('MouseEvents');
				dropEvt.initMouseEvent('drop', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighborPlaceholder);
				dropEvt.dataTransfer = createNewDataTransfer();

				/*
				 *  0     0    1     1    2     2     3
				 * [p0] [id0] [p2] [id1] [p4] [id2] [p5]
				 *              ^_______________|
				 */

				neighborPlaceholder.classList.add('over');
				neighborPlaceholder.dispatchEvent(dropEvt);

				expect(store.getState().routing.waypoints[0]).toEqual([0, 0]);
				expect(store.getState().routing.waypoints[1]).toEqual([2, 2]);
				expect(store.getState().routing.waypoints[2]).toEqual([1, 1]);
				expect(neighborPlaceholder.classList.contains('over')).toBeFalse();
			});

			it('drops on waypoint to be ignored', () => {
				const waypoints = element.shadowRoot.querySelectorAll('ba-routing-waypoint-item');
				const droppedWaypointElement = waypoints[2];
				const dropOnWaypointElement = waypoints[0];
				element.signal('update_dragged_item', droppedWaypointElement.waypoint);
				expect(element.getModel().draggedItem.index).toBe(2);
				const dropEvt = document.createEvent('MouseEvents');
				dropEvt.initMouseEvent('drop', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, dropOnWaypointElement);
				dropEvt.dataTransfer = createNewDataTransfer();

				/*
				 *  0     0    1     1    2     2     3
				 * [p0] [id0] [p2] [id1] [p4] [id2] [p5]
				 *        ^_____________________|
				 */

				dropOnWaypointElement.classList.add('over');
				dropOnWaypointElement.dispatchEvent(dropEvt);

				expect(store.getState().routing.waypoints[0]).toEqual([0, 0]);
				expect(store.getState().routing.waypoints[1]).toEqual([1, 1]);
				expect(store.getState().routing.waypoints[2]).toEqual([2, 2]);
				expect(dropOnWaypointElement.classList.contains('over')).toBeFalse();
			});
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			const element = await setup();

			element.onDisconnect(); // we call onDisconnect manually

			expect(element._storeSubscriptions).toHaveSize(0);
		});
	});
});
