import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { RouteDetails } from '../../../../src/modules/routing/components/routeDetails/RouteDetails';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { bvvChartItemStylesProvider } from '../../../../src/services/provider/chartItemStyles.provider';
import { TestUtils } from '../../../test-utils';
import { RoutingStatusCodes } from '../../../../src/domain/routing';

window.customElements.define(RouteDetails.tag, RouteDetails);
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

describe('RouteDetails', () => {
	const category = { color: 'gray' };
	const routingServiceMock = {
		getCategoryById: () => category,
		getParent: () => 'foo',
		calculateRouteStats: () => mockedRouteStatistic,
		getSurfaceTypeStyles: () => {
			const styles = bvvChartItemStylesProvider();
			return styles['surface'];
		},
		getRoadTypeStyles: () => {
			const styles = bvvChartItemStylesProvider();
			return styles['road'];
		},
		mapRoadTypesToCatalogId: (chartData) => chartData
	};
	const configService = {
		getValue: () => {}
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
			.registerSingleton('ConfigService', configService)
			.registerSingleton('RoutingService', routingServiceMock);

		return TestUtils.render(RouteDetails.tag, properties);
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
			const model = new RouteDetails().getModel();

			expect(model).toEqual({
				status: null,
				warnings: null,
				chartData: null
			});
		});
	});

	describe('when initialized', () => {
		const defaultRoutingState = {
			routing: {
				status: RoutingStatusCodes.Ok,
				categoryId: 'bike'
			}
		};
		it('lazy loads RouteCharts', async () => {
			const element = await setup(defaultRoutingState);

			const lazyLoadElements = element.shadowRoot.querySelectorAll('ba-lazy-load');

			expect(lazyLoadElements).toHaveSize(2);
			expect(Array.from(lazyLoadElements).every((element) => element.content.strings[0].includes('<ba-routing-chart'))).toBeTrue();
		});
	});

	describe('when route changes', () => {
		it('does NOT create chart data from missing statistics', async () => {
			spyOn(routingServiceMock, 'calculateRouteStats').and.returnValue(null);
			const element = await setup();
			const model = element.getModel();
			const chartElements = element.shadowRoot.querySelectorAll('ba-routing-chart');

			expect(chartElements).toHaveSize(0);
			expect(model).toEqual({
				status: 900,
				warnings: {},
				chartData: jasmine.objectContaining({ surface: {}, roadTypes: {} })
			});
		});

		it('creates chart items for unknown surface or road types', async () => {
			const unknownRouteStatistic = {
				time: 3600000,
				details: {
					surface: {
						some: {
							distance: 42,
							segments: [[0, 21]]
						}
					},
					road_class: {
						some: {
							distance: 42,
							segments: [[0, 1]]
						}
					}
				},
				warnings: {},
				stats: {
					sumUp: 42,
					sumDown: 21
				},
				diff: 21,
				twoDiff: [111, 222],
				elPoi: [0, 0],
				dist: 333,
				slopeDist: 42
			};
			spyOn(routingServiceMock, 'calculateRouteStats').and.returnValue(unknownRouteStatistic);
			const element = await setup();
			const model = element.getModel();
			const chartElements = element.shadowRoot.querySelectorAll('ba-routing-chart');

			expect(chartElements).toHaveSize(0);
			expect(model).toEqual({
				status: 900,
				warnings: {},
				chartData: jasmine.objectContaining({
					surface: jasmine.objectContaining({
						some: jasmine.objectContaining({
							id: 0,
							color: 'transparent',
							image: 'repeating-linear-gradient(45deg,gray 25%, transparent 25%,transparent 50%, gray 50%, gray 55%, transparent 55%, transparent)',
							label: 'Unknown'
						})
					}),
					roadTypes: jasmine.objectContaining({
						some: jasmine.objectContaining({
							id: 0,
							color: 'transparent',
							image: 'repeating-linear-gradient(45deg,#eee 0px,#eee 7px, #999 8px, #999 10px, #eee 11px)',
							label: 'Unknown'
						})
					})
				})
			});
		});
	});
});
