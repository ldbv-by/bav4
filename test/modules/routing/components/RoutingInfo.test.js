import { RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { RoutingInfo } from '../../../../src/modules/routing/components/routingInfo/RoutingInfo';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { setRoute } from '../../../../src/store/routing/routing.action';
import { TestUtils } from '../../../test-utils';

window.customElements.define(RoutingInfo.tag, RoutingInfo);

const mockedRouteStatistic = {
	time: 3600000,
	details: {
		surface: {
			other: {
				distance: 1897.9661809258098,
				segments: [
					[0, 13],
					[225, 244],
					[464, 466],
					[874, 876],
					[909, 919],
					[1189, 1196]
				]
			},
			asphalt: {
				distance: 100792.90107550545,
				segments: [
					[13, 225],
					[244, 464],
					[466, 874],
					[876, 909],
					[919, 1189],
					[1196, 1948]
				]
			}
		},
		road_class: {
			track_grade2: {
				distance: 457.5300388069273,
				segments: [
					[0, 13],
					[242, 244],
					[464, 466]
				]
			},
			secondary: {
				distance: 29684.734480945262,
				segments: [
					[13, 113],
					[215, 222],
					[303, 374],
					[398, 402],
					[415, 453],
					[478, 580],
					[714, 874],
					[880, 881],
					[932, 943],
					[947, 964],
					[1001, 1002],
					[1047, 1073],
					[1456, 1466],
					[1541, 1544],
					[1734, 1739],
					[1878, 1902]
				]
			},
			tertiary: {
				distance: 29272.20437937065,
				segments: [
					[113, 215],
					[259, 283],
					[615, 630],
					[634, 654],
					[1073, 1131],
					[1233, 1234],
					[1245, 1246],
					[1310, 1311],
					[1418, 1428],
					[1445, 1456],
					[1572, 1693],
					[1698, 1734],
					[1739, 1834],
					[1850, 1878],
					[1902, 1948]
				]
			},
			residential: {
				distance: 8721.934764111478,
				segments: [
					[222, 225],
					[246, 254],
					[289, 291],
					[374, 398],
					[402, 403],
					[414, 415],
					[453, 455],
					[477, 478],
					[583, 584],
					[654, 714],
					[874, 876],
					[905, 909],
					[919, 926],
					[930, 932],
					[943, 947],
					[1012, 1026],
					[1035, 1047],
					[1131, 1132],
					[1196, 1197],
					[1234, 1238],
					[1240, 1245],
					[1272, 1273],
					[1308, 1310],
					[1428, 1434],
					[1490, 1493],
					[1532, 1541],
					[1693, 1698],
					[1834, 1850]
				]
			},
			track_grade3: {
				distance: 676.7598133050363,
				segments: [[225, 242]]
			},
			track_grade1: {
				distance: 4435.33992013613,
				segments: [
					[244, 246],
					[613, 615],
					[1026, 1035],
					[1165, 1172],
					[1297, 1305],
					[1493, 1532]
				]
			},
			unclassified: {
				distance: 440.08219063893426,
				segments: [
					[254, 259],
					[283, 289],
					[1250, 1251],
					[1406, 1407]
				]
			},
			cycleway: {
				distance: 24618.191923391933,
				segments: [
					[291, 300],
					[403, 414],
					[580, 583],
					[597, 603],
					[876, 880],
					[881, 905],
					[926, 930],
					[964, 1001],
					[1002, 1012],
					[1132, 1165],
					[1172, 1189],
					[1197, 1233],
					[1246, 1250],
					[1251, 1272],
					[1273, 1297],
					[1305, 1308],
					[1311, 1406],
					[1407, 1418],
					[1434, 1445],
					[1466, 1490],
					[1544, 1572]
				]
			},
			primary: {
				distance: 37.34415357921526,
				segments: [[300, 303]]
			},
			path_grade1: {
				distance: 3476.883722331524,
				segments: [
					[455, 464],
					[466, 477],
					[584, 597],
					[603, 613],
					[630, 634]
				]
			},
			path_grade2: {
				distance: 738.4962062949494,
				segments: [
					[909, 919],
					[1189, 1196]
				]
			},
			other: {
				distance: 131.36566351924574,
				segments: [[1238, 1240]]
			}
		}
	},
	warnings: {
		500: {
			message: 'Evtl. hohes Verkehrsaufkommen',
			criticality: 'Hint',
			segments: [
				[13, 113],
				[215, 222],
				[300, 303],
				[303, 374],
				[398, 402],
				[415, 453],
				[478, 580],
				[714, 874],
				[880, 881],
				[932, 943],
				[947, 964],
				[1001, 1002],
				[1047, 1073],
				[1456, 1466],
				[1541, 1544],
				[1734, 1739],
				[1878, 1902]
			]
		}
	},
	stats: {
		sumUp: 927,
		sumDown: 981.3
	},
	diff: -54.30000000000001,
	twoDiff: [111, 222],
	elPoi: [562.2, 323.7],
	dist: 333,
	slopeDist: 102055.31270225867
};
describe('RoutingInfo', () => {
	const etaCalculatorServiceMock = {
		getETACalculatorFor: () => {
			return { getETAfor: () => 42000 };
		}
	};

	const category = { color: 'gray' };
	const routingServiceMock = { getCategoryById: () => category, getParent: () => 'foo', calculateRouteStats: () => mockedRouteStatistic };

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
			.registerSingleton('ETACalculatorService', etaCalculatorServiceMock)
			.registerSingleton('RoutingService', routingServiceMock);

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
				stats: jasmine.objectContaining({ time: 3600000, dist: 333, twoDiff: [111, 222] }),
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
			const defaultRoute = { some: 'route' };
			const defaultRoutingState = {
				routing: {
					status: RoutingStatusCodes.Ok,
					categoryId: 'bike'
				}
			};

			it('renders minimum estimate', async () => {
				const element = await setup(defaultRoutingState);

				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('< 1 min.');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0.33 km');
				expect(routingElements[1].innerText).toBe('111 m');
				expect(routingElements[2].innerText).toBe('222 m');
			});

			it('renders unknown category', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						categoryId: 'some'
					}
				};
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(null);
				const warnSpy = spyOn(console, 'warn');
				const element = await setup(state);
				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('01:00');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0.33 km');
				expect(routingElements[1].innerText).toBe('111 m');
				expect(routingElements[2].innerText).toBe('222 m');

				expect(warnSpy).toHaveBeenCalledOnceWith('Unknown vehicle, no estimate available for unknown (some)');
			});

			it('renders invalid stats (missing twoDiff)', async () => {
				const invalidRouteStatistics = {
					dist: '333',
					time: 3600000
				};
				const calculator = { getETAfor: () => 42000000 };
				spyOn(routingServiceMock, 'calculateRouteStats').and.returnValue(invalidRouteStatistics);
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				const element = await setup(defaultRoutingState);
				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('01:00');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0.33 km');
				expect(routingElements[1].innerText).toBe('0 m');
				expect(routingElements[2].innerText).toBe('0 m');
			});

			it('renders invalid stats (invalid twoDiff)', async () => {
				const invalidRouteStatistics = {
					dist: '333',
					twoDiff: [111],
					time: 3600000
				};
				const calculator = { getETAfor: () => 42000000 };
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				spyOn(routingServiceMock, 'calculateRouteStats').and.returnValue(invalidRouteStatistics);
				const element = await setup(defaultRoutingState);
				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('01:00');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0.33 km');
				expect(routingElements[1].innerText).toBe('0 m');
				expect(routingElements[2].innerText).toBe('0 m');
			});

			it('renders invalid stats (missing dist)', async () => {
				const invalidRouteStatistics = {
					twoDiff: [111, 222],
					time: 3600000
				};

				const calculator = { getETAfor: () => 42000000 };
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				spyOn(routingServiceMock, 'calculateRouteStats').and.returnValue(invalidRouteStatistics);
				const element = await setup(defaultRoutingState);
				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('01:00');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0 km');
				expect(routingElements[1].innerText).toBe('111 m');
				expect(routingElements[2].innerText).toBe('222 m');
			});

			it('renders missing stats', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						categoryId: 'some'
					}
				};
				const calculator = { getETAfor: () => 42000000 };
				spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').and.returnValue(calculator);
				spyOn(routingServiceMock, 'calculateRouteStats').and.returnValue(null);
				const element = await setup(state);
				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('-:-');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0 km');
				expect(routingElements[1].innerText).toBe('0 m');
				expect(routingElements[2].innerText).toBe('0 m');
			});

			describe('when rendering estimate for specific vehicle', () => {
				it('calculates the estimate for hike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							categoryId: 'hike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('hike').and.returnValue(calculator);
					const element = await setup(state);

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
					expect(routingDuration[0].innerText).toBe('11:40');

					const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
					expect(routingElements).toHaveSize(3);
					expect(routingElements[0].innerText).toBe('0.33 km');
					expect(routingElements[1].innerText).toBe('111 m');
					expect(routingElements[2].innerText).toBe('222 m');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bvv-hike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							categoryId: 'bvv-hike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('hike').and.returnValue(calculator);
					const element = await setup(state);

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
					expect(routingDuration[0].innerText).toBe('11:40');

					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							categoryId: 'bike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('bike').and.returnValue(calculator);
					const element = await setup(state);

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
					expect(routingDuration[0].innerText).toBe('11:40');
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

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');

					expect(routingDuration[0].innerText).toBe('11:40');
					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bayernnetz-bike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							categoryId: 'bayernnetz-bike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('bike').and.returnValue(calculator);
					const element = await setup(state);

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');

					expect(routingDuration[0].innerText).toBe('11:40');
					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for mtb', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							categoryId: 'mtb'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('mtb').and.returnValue(calculator);
					const element = await setup(state);

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');

					expect(routingDuration[0].innerText).toBe('11:40');
					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for bvv-mtb', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							categoryId: 'bvv-mtb'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('mtb').and.returnValue(calculator);
					const element = await setup(state);

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
					expect(routingDuration[0].innerText).toBe('11:40');
					expect(calculatorSpy).toHaveBeenCalled();
				});

				it('calculates the estimate for racingbike', async () => {
					const state = {
						routing: {
							status: RoutingStatusCodes.Ok,
							categoryId: 'racingbike'
						}
					};
					const calculator = { getETAfor: () => 42000000 };
					const calculatorSpy = spyOn(etaCalculatorServiceMock, 'getETACalculatorFor').withArgs('racingbike').and.returnValue(calculator);
					const element = await setup(state);

					const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
					expect(routingDuration[0].innerText).toBe('11:40');
					expect(calculatorSpy).toHaveBeenCalled();
				});
			});
		});
	});
});
