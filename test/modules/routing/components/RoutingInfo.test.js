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

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		describe('when display RouteInfo', () => {
			it('renders minimum estimate', async () => {
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

			it('renders unknown category', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						stats: {
							twoDiff: [111, 222],
							dist: 333,
							time: 3600000
						},
						categoryId: 'some'
					}
				};

				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(null);
				const warnSpy = spyOn(console, 'warn');
				const element = await setup(state);

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

				expect(routingElements).toHaveSize(4);
				expect(routingElements[0].innerText).toBe('01:00');
				expect(routingElements[1].innerText).toBe('0.33 km');
				expect(routingElements[2].innerText).toBe('111 m');
				expect(routingElements[3].innerText).toBe('222 m');
				expect(warnSpy).toHaveBeenCalledOnceWith('Unknown vehicle, no estimate available for unknown (some)');
			});

			it('renders invalid stats (missing twoDiff)', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						stats: {
							dist: '333',
							time: 3600000
						},
						categoryId: 'some'
					}
				};
				const calculator = { getETAfor: () => 42000000 };
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				const element = await setup(state);

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

				expect(routingElements).toHaveSize(4);
				expect(routingElements[0].innerText).toBe('01:00');
				expect(routingElements[1].innerText).toBe('0.33 km');
				expect(routingElements[2].innerText).toBe('0 m');
				expect(routingElements[3].innerText).toBe('0 m');
			});

			it('renders invalid stats (invalid twoDiff)', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						stats: {
							dist: '333',
							twoDiff: [111],
							time: 3600000
						},
						categoryId: 'some'
					}
				};
				const calculator = { getETAfor: () => 42000000 };
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				const element = await setup(state);

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

				expect(routingElements).toHaveSize(4);
				expect(routingElements[0].innerText).toBe('01:00');
				expect(routingElements[1].innerText).toBe('0.33 km');
				expect(routingElements[2].innerText).toBe('0 m');
				expect(routingElements[3].innerText).toBe('0 m');
			});

			it('renders invalid stats (missing dist)', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						stats: {
							twoDiff: [111, 222],
							time: 3600000
						},
						categoryId: 'some'
					}
				};
				const calculator = { getETAfor: () => 42000000 };
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				const element = await setup(state);

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

				expect(routingElements).toHaveSize(4);
				expect(routingElements[0].innerText).toBe('01:00');
				expect(routingElements[1].innerText).toBe('0 km');
				expect(routingElements[2].innerText).toBe('111 m');
				expect(routingElements[3].innerText).toBe('222 m');
			});

			it('renders missing stats', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						stats: null,
						categoryId: 'some'
					}
				};
				const calculator = { getETAfor: () => 42000000 };
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				const element = await setup(state);

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

				expect(routingElements).toHaveSize(4);
				expect(routingElements[0].innerText).toBe('-:-');
				expect(routingElements[1].innerText).toBe('0 km');
				expect(routingElements[2].innerText).toBe('0 m');
				expect(routingElements[3].innerText).toBe('0 m');
			});

			describe('when rendering estimate for specific vehicle', () => {
				it('calculates the estimate for hike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							stats: {
								twoDiff: [111, 222],
								dist: 333,
								time: 3600000
							},
							categoryId: 'hike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('hike').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bvv-hike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							stats: {
								twoDiff: [111, 222],
								dist: 333,
								time: 3600000
							},
							categoryId: 'bvv-hike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('hike').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bike', async () => {
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
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('bike').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bvv-bike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							stats: {
								twoDiff: [111, 222],
								dist: 333,
								time: 3600000
							},
							categoryId: 'bvv-bike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('bike').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bayernnetz-bike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							stats: {
								twoDiff: [111, 222],
								dist: 333,
								time: 3600000
							},
							categoryId: 'bayernnetz-bike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('bike').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for mtb', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							stats: {
								twoDiff: [111, 222],
								dist: 333,
								time: 3600000
							},
							categoryId: 'mtb'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('mtb').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bvv-mtb', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							stats: {
								twoDiff: [111, 222],
								dist: 333,
								time: 3600000
							},
							categoryId: 'bvv-mtb'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('mtb').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for racingbike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							stats: {
								twoDiff: [111, 222],
								dist: 333,
								time: 3600000
							},
							categoryId: 'racingbike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('racingbike').and.returnValue(calculator);
					const element = await setup(state);

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');

					expect(routingElements).toHaveSize(4);
					expect(routingElements[0].innerText).toBe('11:40');
					expect(routingElements[1].innerText).toBe('0.33 km');
					expect(routingElements[2].innerText).toBe('111 m');
					expect(routingElements[3].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});
			});
		});
	});
});
