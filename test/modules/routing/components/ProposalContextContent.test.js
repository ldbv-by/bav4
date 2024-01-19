import { $injector } from '../../../../src/injection';
import { ProposalContextContent } from '../../../../src/modules/routing/components/contextMenu/ProposalContextContent';
import { initialState as initialRoutingState, routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { EventLike } from '../../../../src/utils/storeUtils';
import { reset, setProposal } from '../../../../src/store/routing/routing.action';
import { CoordinateProposalType, RoutingStatusCodes } from '../../../../src/domain/routing';
import { bottomSheetReducer } from '../../../../src/store/bottomSheet/bottomSheet.reducer';
import { mapContextMenuReducer } from '../../../../src/store/mapContextMenu/mapContextMenu.reducer';

window.customElements.define(ProposalContextContent.tag, ProposalContextContent);

describe('ProposalContextContent', () => {
	let store;
	const setup = (state, properties = {}) => {
		const initialState = {
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			routing: routingReducer,
			bottomSheet: bottomSheetReducer,
			mapContextMenu: mapContextMenuReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(ProposalContextContent.tag, properties);
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
			const model = new ProposalContextContent().getModel();

			expect(model).toEqual({
				proposal: null,
				preventClose: false
			});
		});
	});

	describe('when initialized', () => {
		it('observes store.routing.proposal s-o-s', async () => {
			const element = await setup();
			const spy = spyOn(element, 'signal').withArgs('update_proposal', jasmine.any(EventLike)).and.callThrough();

			setProposal([0, 0], CoordinateProposalType.START);

			expect(spy).toHaveBeenCalled();
		});

		describe('and store.routing.proposal s-o-s has a CoordinateProposal', () => {
			it('renders action-buttons for START_OR_DESTINATION', async () => {
				const element = await setup({
					routing: {
						...initialRoutingState,
						...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.START_OR_DESTINATION }) }
					}
				});

				const buttons = element.shadowRoot.querySelectorAll('button');
				expect(buttons).toHaveSize(2);
				expect(buttons[0].id).toBe('start');
				expect(buttons[1].id).toBe('destination');
			});

			it('renders action-buttons for START', async () => {
				const element = await setup({
					routing: { ...initialRoutingState, ...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.START }) } }
				});

				const buttons = element.shadowRoot.querySelectorAll('button');
				expect(buttons).toHaveSize(1);
				expect(buttons[0].id).toBe('start');
			});

			it('renders action-buttons for DESTINATION', async () => {
				const element = await setup({
					routing: { ...initialRoutingState, ...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.DESTINATION }) } }
				});

				const buttons = element.shadowRoot.querySelectorAll('button');
				expect(buttons).toHaveSize(1);
				expect(buttons[0].id).toBe('destination');
			});

			it('renders action-buttons for INTERMEDIATE', async () => {
				const element = await setup({
					routing: { ...initialRoutingState, ...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.INTERMEDIATE }) } }
				});

				const buttons = element.shadowRoot.querySelectorAll('button');
				expect(buttons).toHaveSize(1);
				expect(buttons[0].id).toBe('intermediate');
			});

			it('renders action-buttons for EXISTING_INTERMEDIATE', async () => {
				const element = await setup({
					routing: {
						...initialRoutingState,
						...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.EXISTING_INTERMEDIATE }) }
					}
				});

				const buttons = element.shadowRoot.querySelectorAll('button');
				expect(buttons).toHaveSize(1);
				expect(buttons[0].id).toBe('remove');
			});

			it('renders action-buttons for EXISTING_START_OR_DESTINATION', async () => {
				const element = await setup({
					routing: {
						...initialRoutingState,
						...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.EXISTING_START_OR_DESTINATION }) }
					}
				});

				const buttons = element.shadowRoot.querySelectorAll('button');
				expect(buttons).toHaveSize(1);
				expect(buttons[0].id).toBe('remove');
			});

			describe('and the button is clicked', () => {
				it('stores the coordinate as starting coordinate', async () => {
					const element = await setup({
						routing: { ...initialRoutingState, ...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.START }) } }
					});

					element.shadowRoot.querySelector('#start').click();

					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Destination_Missing);
					expect(store.getState().routing.waypoints).toEqual([[42, 21]]);

					reset();

					setProposal([5, 55], CoordinateProposalType.START_OR_DESTINATION);

					element.shadowRoot.querySelector('#start').click();

					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Destination_Missing);
					expect(store.getState().routing.waypoints).toEqual([[5, 55]]);
				});

				it('stores the coordinate as destination coordinate', async () => {
					const element = await setup({
						routing: { ...initialRoutingState, ...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.DESTINATION }) } }
					});

					element.shadowRoot.querySelector('#destination').click();

					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Start_Missing);
					expect(store.getState().routing.waypoints).toEqual([[42, 21]]);

					reset();

					setProposal([5, 55], CoordinateProposalType.START_OR_DESTINATION);

					element.shadowRoot.querySelector('#destination').click();

					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Start_Missing);
					expect(store.getState().routing.waypoints).toEqual([[5, 55]]);
				});

				it('stores the coordinate as intermediate coordinate', async () => {
					const element = await setup({
						routing: {
							...initialRoutingState,
							...{
								waypoints: [
									[0, 0],
									[1, 1]
								],
								status: RoutingStatusCodes.Ok,
								proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.INTERMEDIATE })
							}
						}
					});

					element.shadowRoot.querySelector('#intermediate').click();

					expect(store.getState().routing.intermediate).toEqual(jasmine.objectContaining({ payload: [42, 21] }));
				});

				it('removes the coordinate as existing intermediate', async () => {
					const element = await setup({
						routing: {
							...initialRoutingState,
							waypoints: [
								[0, 0],
								[42, 21],
								[1, 1]
							],
							status: RoutingStatusCodes.Ok,
							proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.EXISTING_INTERMEDIATE })
						}
					});

					element.shadowRoot.querySelector('#remove').click();

					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Ok);
					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[1, 1]
					]);
				});

				it('removes the coordinate as existing intermediate', async () => {
					const element = await setup({
						routing: {
							...initialRoutingState,
							...{
								waypoints: [
									[42, 21],
									[1, 1]
								],
								status: RoutingStatusCodes.Ok,
								proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.EXISTING_START_OR_DESTINATION })
							}
						}
					});

					element.shadowRoot.querySelector('#remove').click();

					expect(store.getState().routing.status).toBe(RoutingStatusCodes.Start_Missing);
					expect(store.getState().routing.waypoints).toEqual([[1, 1]]);
				});
			});
		});

		it('requests the closing of bottomSheet and ContextMenu', async () => {
			const element = await setup({
				routing: { ...initialRoutingState, ...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.START }) } },
				bottomSheet: { active: true },
				mapContextMenu: { active: true }
			});

			element.shadowRoot.querySelector('#start').click();

			expect(store.getState().bottomSheet.active).toBeFalse();
			expect(store.getState().mapContextMenu.active).toBeFalse();
		});

		describe('and preventClose property is set', () => {
			it('does NOT request the closing of bottomSheet and ContextMenu', async () => {
				const element = await setup(
					{
						routing: { ...initialRoutingState, ...{ proposal: new EventLike({ coord: [42, 21], type: CoordinateProposalType.START }) } },
						bottomSheet: { active: true },
						mapContextMenu: { active: true }
					},
					{ preventClose: true }
				);

				element.shadowRoot.querySelector('#start').click();

				expect(store.getState().bottomSheet.active).toBeTrue();
				expect(store.getState().mapContextMenu.active).toBeTrue();
			});
		});
	});
});
