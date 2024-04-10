import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { RouteDetails } from '../../../../src/modules/routing/components/routeDetails/RouteDetails';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { bvvChartItemStylesProvider } from '../../../../src/services/provider/chartItemStyles.provider';
import { TestUtils } from '../../../test-utils';
import { RoutingStatusCodes } from '../../../../src/domain/routing';

window.customElements.define(RouteDetails.tag, RouteDetails);

describe('RouteDetails', () => {
	const category = { color: 'gray' };
	const defaultRoutingState = {
		routing: {
			status: RoutingStatusCodes.Ok,
			categoryId: 'bike',
			stats: null
		}
	};
	const routingServiceMock = {
		getCategoryById: () => category,
		getParent: () => 'foo',
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
		it('renders RouteCharts', async () => {
			const element = await setup(defaultRoutingState);

			const chartElements = element.shadowRoot.querySelectorAll('ba-routing-chart');

			expect(chartElements).toHaveSize(2);
		});
	});

	describe('when route changes', () => {
		it('does NOT create chart data from missing statistics', async () => {
			const element = await setup(defaultRoutingState);
			const model = element.getModel();
			const chartElements = element.shadowRoot.querySelectorAll('ba-routing-chart');

			expect(chartElements).toHaveSize(2);
			expect(model).toEqual({
				status: 200,
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
			const element = await setup({ routing: { status: RoutingStatusCodes.Ok, categoryId: 'bike', stats: unknownRouteStatistic } });
			const model = element.getModel();
			const chartElements = element.shadowRoot.querySelectorAll('ba-routing-chart');

			expect(chartElements).toHaveSize(2);
			expect(model).toEqual({
				status: 200,
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
