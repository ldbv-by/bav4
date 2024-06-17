import { RoutingStatusCodes } from '../../../../src/domain/routing';
import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { RouteInfo } from '../../../../src/modules/routing/components/routeInfo/RouteInfo';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { setRoute } from '../../../../src/store/routing/routing.action';
import { TestUtils } from '../../../test-utils';

window.customElements.define(RouteInfo.tag, RouteInfo);

const defaultRouteStatistic = {
	time: 4200000,
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
describe('RouteInfo', () => {
	const category = { style: { color: 'red', icon: 'icon_category' } };
	const routingServiceMock = {
		getCategoryById: () => category,
		getParent: () => 'foo'
	};

	const unitsServiceMock = {
		formatDistance: (distance) => {
			return distance > 100 ? (distance / 1000).toFixed(2) + ' km' : distance + ' m';
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
			.registerSingleton('UnitsService', unitsServiceMock)
			.registerSingleton('RoutingService', routingServiceMock);

		return TestUtils.render(RouteInfo.tag, properties);
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
			const model = new RouteInfo().getModel();

			expect(model).toEqual({
				status: null,
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
			const defaultRoute = { some: 'route' };
			const defaultRoutingState = {
				routing: {
					status: RoutingStatusCodes.Ok,
					categoryId: 'bike'
				}
			};

			it('renders minimum estimate', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						categoryId: 'bike',
						stats: {
							dist: '333',
							twoDiff: [111, 222],
							time: 42
						}
					}
				};
				const element = await setup(state);

				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('< 1 min.');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0.33 km');
				expect(routingElements[1].innerText).toBe('0.11 km');
				expect(routingElements[2].innerText).toBe('0.22 km');
			});

			it('renders unknown category', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						categoryId: 'some',
						stats: defaultRouteStatistic
					}
				};

				const element = await setup(state);
				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('01:10');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('0.33 km');
				expect(routingElements[1].innerText).toBe('0.11 km');
				expect(routingElements[2].innerText).toBe('0.22 km');
			});

			it('renders missing stats', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Ok,
						categoryId: 'some',
						stats: null
					}
				};

				const element = await setup(state);
				setRoute(defaultRoute);

				const routingDuration = element.shadowRoot.querySelectorAll('.routing-info-duration');
				expect(routingDuration[0].innerText).toBe('-:-');

				const routingElements = element.shadowRoot.querySelectorAll('.routing-info-text');
				expect(routingElements).toHaveSize(3);
				expect(routingElements[0].innerText).toBe('-');
				expect(routingElements[1].innerText).toBe('-');
				expect(routingElements[2].innerText).toBe('-');
			});

			it('renders category icon', async () => {
				const element = await setup(defaultRoutingState);

				setRoute(defaultRoute);

				expect(element.shadowRoot.querySelector('.category-icon').innerHTML).toContain('icon_category');
			});

			it('renders NOTHING, if category.style.icon is missing', async () => {
				const missingIconCategory = { style: { color: 'red', icon: null } };
				spyOn(routingServiceMock, 'getCategoryById').and.returnValue(missingIconCategory);
				const element = await setup(defaultRoutingState);

				setRoute(defaultRoute);

				expect(element.shadowRoot.querySelector('.category-icon')).toBeNull();
			});

			it('renders parent category style, if category.style is missing', async () => {
				const missingIconCategory = { style: { color: null, icon: null } };
				const parentCategory = { style: { color: 'blue', icon: 'icon_parent_category' } };
				spyOn(routingServiceMock, 'getCategoryById').and.callFake((category) => {
					return category === 'bike' ? missingIconCategory : parentCategory;
				});
				const element = await setup(defaultRoutingState);

				setRoute(defaultRoute);

				expect(element.shadowRoot.querySelector('.category-icon').innerHTML).toContain('icon_parent_category');
			});
		});
	});
});
