import { RouteCalculationErrors } from '../../src/domain/routing';
import { $injector } from '../../src/injection';
import { BvvRoutingService, CHART_ITEM_ROAD_STYLE_UNKNOWN, CHART_ITEM_SURFACE_STYLE_UNKNOWN } from '../../src/services/RoutingService';
import { bvvChartItemStylesProvider } from '../../src/services/provider/chartItemStyles.provider';
import { bvvOsmRoadTypeMappingProvider } from '../../src/services/provider/osmRoadTypeMapping.provider';
import { bvvRouteProvider } from '../../src/services/provider/route.provider';
import { bvvRoutingCategoriesProvider } from '../../src/services/provider/routingCategories.provider';

describe('BvvRoutingService', () => {
	const elevationServiceMock = {
		async getProfile() {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ElevationService', elevationServiceMock);
	});

	const setup = (
		routingCategoriesProvider = bvvRoutingCategoriesProvider,
		routeProvider = bvvRouteProvider,
		chartItemStylesProvider = bvvChartItemStylesProvider,
		osmRoadTypeMappingProvider = bvvOsmRoadTypeMappingProvider
	) => {
		return new BvvRoutingService(routingCategoriesProvider, routeProvider, chartItemStylesProvider, osmRoadTypeMappingProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			const instanceUnderTest = new BvvRoutingService();
			expect(instanceUnderTest._categoriesProvider).toEqual(bvvRoutingCategoriesProvider);
			expect(instanceUnderTest._routeProvider).toEqual(bvvRouteProvider);
			expect(instanceUnderTest._chartItemsStylesProvider).toEqual(bvvChartItemStylesProvider);
			expect(instanceUnderTest._osmRoadTypeMapper).toEqual(bvvOsmRoadTypeMappingProvider);
		});

		it('initializes the service with custom provider', async () => {
			const customRoutingCategoriesProvider = async () => {};
			const customRouteProvider = async () => {};
			const customChartItemStylesProvider = () => {};
			const customOsmRoadTypeMappingProvider = () => {};
			const instanceUnderTest = setup(
				customRoutingCategoriesProvider,
				customRouteProvider,
				customChartItemStylesProvider,
				customOsmRoadTypeMappingProvider
			);
			expect(instanceUnderTest._categoriesProvider).toEqual(customRoutingCategoriesProvider);
			expect(instanceUnderTest._routeProvider).toEqual(customRouteProvider);
			expect(instanceUnderTest._chartItemsStylesProvider).toEqual(customChartItemStylesProvider);
			expect(instanceUnderTest._osmRoadTypeMapper).toEqual(customOsmRoadTypeMappingProvider);
		});
	});

	describe('init', () => {
		it('initializes the service and loads the categories', async () => {
			const mockCategories = ['foo', 'bar'];
			const categoriesProvider = jasmine.createSpy().and.resolveTo(mockCategories);
			const instanceUnderTest = setup(categoriesProvider);

			expect(instanceUnderTest._categories).toBeNull();

			await expectAsync(instanceUnderTest.init()).toBeResolvedTo(mockCategories);
			await expectAsync(instanceUnderTest.init()).toBeResolvedTo(mockCategories); // second call served from cache

			expect(categoriesProvider).toHaveBeenCalledTimes(1);
		});
	});

	describe('getCategories', () => {
		it('provides all categories', async () => {
			const mockCategories = ['foo', 'bar'];
			const categoriesProvider = jasmine.createSpy().and.resolveTo(mockCategories);
			const instanceUnderTest = setup(categoriesProvider);

			expect(instanceUnderTest.getCategories()).toEqual([]);

			await instanceUnderTest.init();

			expect(instanceUnderTest.getCategories()).toEqual(mockCategories);
		});
	});

	describe('getCategoryById', () => {
		it('finds a category by its id', async () => {
			const hike = {
				id: 'hike',
				label: 'hike',
				subcategories: []
			};
			const hike2 = {
				id: 'hike2',
				label: 'hike2',
				subcategories: [hike]
			};

			const mockCategories = [hike2];
			const categoriesProvider = jasmine.createSpy().and.resolveTo(mockCategories);
			const instanceUnderTest = setup(categoriesProvider);
			await instanceUnderTest.init();

			expect(instanceUnderTest.getCategoryById('hike')).toEqual(hike);
			expect(instanceUnderTest.getCategoryById('hike2')).toEqual(hike2);
			expect(instanceUnderTest.getCategoryById('foo')).toBeNull();
		});
	});

	describe('getParent', () => {
		it('finds a parent category by its id', async () => {
			const hike = {
				id: 'hike',
				label: 'hike',
				subcategories: []
			};
			const hike2 = {
				id: 'hike2',
				label: 'hike2',
				subcategories: [hike]
			};
			const hike3 = {
				id: 'hike3',
				label: 'hike3',
				subcategories: []
			};

			const mockCategories = [hike2, hike3];
			const categoriesProvider = jasmine.createSpy().and.resolveTo(mockCategories);
			const instanceUnderTest = setup(categoriesProvider);
			await instanceUnderTest.init();

			expect(instanceUnderTest.getParent('hike')).toBe('hike2');
			expect(instanceUnderTest.getParent('hike2')).toBe('hike2');
			expect(instanceUnderTest.getParent('hike3')).toBe('hike3');
			expect(instanceUnderTest.getParent('unknown')).toBeNull();
		});
	});

	describe('calculate', () => {
		it('provides a routing result', async () => {
			const mockRoute = { foo: {} };
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];
			const mockRouteProvider = jasmine.createSpy().withArgs(['foo'], mockCoordinates).and.resolveTo(mockRoute);
			const instanceUnderTest = setup(null, mockRouteProvider);

			const result = await instanceUnderTest.calculateRoute(['foo'], mockCoordinates);

			expect(result).toEqual(mockRoute);
		});

		it('rejects when provider fails', async () => {
			const providerError = new Error('Something got wrong', { cause: RouteCalculationErrors.Improper_Waypoints });
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];
			const mockRouteProvider = jasmine.createSpy().withArgs(['foo'], mockCoordinates).and.rejectWith(providerError);
			const instanceUnderTest = setup(null, mockRouteProvider);

			await expectAsync(instanceUnderTest.calculateRoute(['foo'], mockCoordinates)).toBeRejectedWith(providerError);
		});

		it('rejects when argument "coordinates3857" is not an Array or does not contain at least two coordinates', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.calculateRoute(['foo'], 12345)).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
			await expectAsync(instanceUnderTest.calculateRoute(['foo'], [12345])).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
			await expectAsync(instanceUnderTest.calculateRoute(['foo'], [[11, 11]])).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
			await expectAsync(
				instanceUnderTest.calculateRoute(
					['foo'],
					[
						[11, 11],
						[22, '22']
					]
				)
			).toBeRejectedWithError(TypeError, "Parameter 'coordinates3857' contains invalid coordinates");
		});

		it('rejects when argument "categories" is not an Array or does not contain at least two coordinates', async () => {
			const instanceUnderTest = setup();

			await expectAsync(
				instanceUnderTest.calculateRoute('foo', [
					[1, 2],
					[3, 4]
				])
			).toBeRejectedWithError(TypeError, "Parameter 'categories' must be an array containing at least one category");
			await expectAsync(
				instanceUnderTest.calculateRoute(
					[],
					[
						[1, 2],
						[3, 4]
					]
				)
			).toBeRejectedWithError(TypeError, "Parameter 'categories' must be an array containing at least one category");
		});
	});

	describe('getAlternativeCategoryIds', () => {
		it('alternative category ids', () => {
			const hike = {
				id: 'hike',
				label: 'hike',
				subcategories: []
			};
			const hike2 = {
				id: 'hike2',
				label: 'hike2',
				subcategories: []
			};
			const hike3 = {
				id: 'hike3',
				label: 'hike3',
				subcategories: [hike, hike2]
			};
			const bike = {
				id: 'bike',
				label: 'bike',
				subcategories: []
			};

			const mockCategories = [hike3, bike];
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, 'getCategories').and.returnValue(mockCategories);

			expect(instanceUnderTest.getAlternativeCategoryIds('hike')).toEqual(['hike3', 'hike2']);
			expect(instanceUnderTest.getAlternativeCategoryIds('hike2')).toEqual(['hike3', 'hike']);
			expect(instanceUnderTest.getAlternativeCategoryIds('hike3')).toEqual(['hike', 'hike2']);
			expect(instanceUnderTest.getAlternativeCategoryIds('bike')).toEqual([]);
			expect(instanceUnderTest.getAlternativeCategoryIds('unknown')).toEqual([]);
		});
	});

	describe('getRoadTypeStyles', () => {
		it('provides RoadTypeStyles from ChartItemStylesProvider', async () => {
			const roadStylesMock = { foo: 'bar' };
			const mockChartItemStylesProvider = () => {
				return { road: roadStylesMock };
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getRoadTypeStyles();

			expect(styles).toEqual(
				jasmine.objectContaining({
					foo: 'bar',
					unknown: {
						id: 0,
						color: 'transparent',
						image: 'repeating-linear-gradient(45deg,#eee 0px,#eee 7px, #999 8px, #999 10px, #eee 11px)',
						label: 'Unknown'
					}
				})
			);
		});

		it('provides default styles object from ChartItemStylesProvider', async () => {
			const mockChartItemStylesProvider = () => {
				return { some: {} };
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getRoadTypeStyles();

			expect(styles).toEqual(jasmine.objectContaining({ unknown: CHART_ITEM_ROAD_STYLE_UNKNOWN }));
		});

		it('allows the provider to override default style object ', async () => {
			const mockChartItemStylesProvider = () => {
				return {
					road: {
						unknown: {
							id: 0,
							color: 'foo',
							image: 'bar',
							label: 'baz'
						}
					}
				};
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getRoadTypeStyles();

			expect(styles).toEqual(
				jasmine.objectContaining({
					unknown: {
						id: 0,
						color: 'foo',
						image: 'bar',
						label: 'baz'
					}
				})
			);
		});
	});

	describe('getSurfaceTypeStyles', () => {
		it('provides SurfaceType from ChartItemStylesProvider', async () => {
			const surfaceStylesMock = { foo: 'bar' };
			const mockChartItemStylesProvider = () => {
				return { surface: surfaceStylesMock };
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getSurfaceTypeStyles();

			expect(styles).toEqual(
				jasmine.objectContaining({
					foo: 'bar',
					unknown: {
						id: 0,
						color: 'transparent',
						image: 'repeating-linear-gradient(45deg,gray 25%, transparent 25%,transparent 50%, gray 50%, gray 55%, transparent 55%, transparent)',
						label: 'Unknown'
					}
				})
			);
		});

		it('provides default styles object from ChartItemStylesProvider', async () => {
			const mockChartItemStylesProvider = () => {
				return { some: {} };
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getSurfaceTypeStyles();

			expect(styles).toEqual(jasmine.objectContaining({ unknown: CHART_ITEM_SURFACE_STYLE_UNKNOWN }));
		});

		it('allows the provider to override default style object ', async () => {
			const mockChartItemStylesProvider = () => {
				return {
					surface: {
						unknown: {
							id: 0,
							color: 'foo',
							image: 'bar',
							label: 'baz'
						}
					}
				};
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getSurfaceTypeStyles();

			expect(styles).toEqual(
				jasmine.objectContaining({
					unknown: {
						id: 0,
						color: 'foo',
						image: 'bar',
						label: 'baz'
					}
				})
			);
		});
	});

	describe('mapRoadTypesToCatalogId', () => {
		it('maps osm road class name to defined catalogId', async () => {
			const osmClasses = {
				foo: { absolute: 4, relative: 42, segments: [0, 1] },
				other: { absolute: 2, relative: 55, segments: [0, 1] }
			};
			const mockOsmRoadTypeMappingProvider = (osmRoadType) => (osmRoadType === 'foo' ? 'bar' : null);

			const instanceUnderTest = setup(null, null, null, mockOsmRoadTypeMappingProvider);
			const roadClasses = instanceUnderTest.mapRoadTypesToCatalogId(osmClasses);

			expect(roadClasses.bar.absolute).toBe(4);
			expect(roadClasses.other.absolute).toBe(2);
			expect(roadClasses.bar.relative).toBe(42);
			expect(roadClasses.other.relative).toBe(55);
			expect(roadClasses.bar.segments).toEqual([0, 1]);
			expect(roadClasses.other.segments).toEqual([0, 1]);
		});

		it('maps and merges osm road class map to application road classes', async () => {
			const osmClasses = {
				foo: { absolute: 2, relative: 33, segments: [0, 1] },
				other: { absolute: 2, relative: 33, segments: [2, 3] },
				track_grade1: { absolute: 2, relative: 100, segments: [4, 6] }
			};
			const mockOsmRoadTypeMappingProvider = (osmRoadType) => (osmRoadType === 'foo' || osmRoadType === 'other' ? 'other' : null);

			const instanceUnderTest = setup(null, null, null, mockOsmRoadTypeMappingProvider);
			const roadClasses = instanceUnderTest.mapRoadTypesToCatalogId(osmClasses);

			expect(roadClasses.other.absolute).toBe(4);
			expect(roadClasses.other.relative).toBe(66);
			expect(roadClasses.other.segments).toEqual([0, 1, 2, 3]);

			expect(roadClasses.track_grade1.absolute).toBe(2);
			expect(roadClasses.track_grade1.relative).toBe(100);
			expect(roadClasses.track_grade1.segments).toEqual([4, 6]);
		});
	});
});
