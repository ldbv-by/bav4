import { BvvRoutingService, mockCategoriesProvider } from '../../src/services/RoutingService';
import { bvvChartItemStylesProvider } from '../../src/services/provider/chartItemStyles.provider';
import { bvvOsmRoadTypeMappingProvider } from '../../src/services/provider/osmRoadTypeMapper.provider';
import { bvvRouteProvider } from '../../src/services/provider/route.provider';

describe('mockProvider', () => {
	it('returns the correct categories', async () => {
		const categories = await mockCategoriesProvider();
		expect(categories).toHaveSize(4);
	});
});

describe('BvvRoutingService', () => {
	const setup = (
		routingCategoriesProvider = mockCategoriesProvider,
		routeProvider = bvvRouteProvider,
		chartItemStylesProvider = bvvChartItemStylesProvider,
		osmRoadTypeMappingProvider = bvvOsmRoadTypeMappingProvider
	) => {
		return new BvvRoutingService(routingCategoriesProvider, routeProvider, chartItemStylesProvider, osmRoadTypeMappingProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			const instanceUnderTest = new BvvRoutingService();
			expect(instanceUnderTest._categoriesProvider).toEqual(mockCategoriesProvider);
			expect(instanceUnderTest._routeProvider).toEqual(bvvRouteProvider);
			expect(instanceUnderTest._chartItemsStylesProvider).toEqual(bvvChartItemStylesProvider);
			expect(instanceUnderTest._mapper).toEqual(bvvOsmRoadTypeMappingProvider);
		});

		it('initializes the service with custom provider', async () => {
			const customRoutingCategoriesProvider = async () => {};
			const customRouteProvider = async () => {};
			const instanceUnderTest = setup(customRoutingCategoriesProvider, customRouteProvider);
			expect(instanceUnderTest._categoriesProvider).toEqual(customRoutingCategoriesProvider);
			expect(instanceUnderTest._routeProvider).toEqual(customRouteProvider);
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

			const result = await instanceUnderTest.calculate(['foo'], mockCoordinates);

			expect(result).toEqual(mockRoute);
		});

		it('rejects when provider fails', async () => {
			const providerError = new Error('Something got wrong');
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];
			const mockRouteProvider = jasmine.createSpy().withArgs(['foo'], mockCoordinates).and.rejectWith(providerError);
			const instanceUnderTest = setup(null, mockRouteProvider);

			await expectAsync(instanceUnderTest.calculate(['foo'], mockCoordinates)).toBeRejectedWith(
				jasmine.objectContaining({
					message: 'Could not retrieve a routing result from the provider',
					cause: providerError
				})
			);
		});

		it('rejects when argument "coordinates3857" is not an Array or does not contain at least two coordinates', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.calculate(['foo'], 12345)).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
			await expectAsync(instanceUnderTest.calculate(['foo'], [12345])).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
			await expectAsync(instanceUnderTest.calculate(['foo'], [[11, 11]])).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
			await expectAsync(
				instanceUnderTest.calculate(
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
				instanceUnderTest.calculate('foo', [
					[1, 2],
					[3, 4]
				])
			).toBeRejectedWithError(TypeError, "Parameter 'categories' must be an array containing at least one category");
			await expectAsync(
				instanceUnderTest.calculate(
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
		it('alternative category ids', async () => {
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

			expect(styles).toEqual(roadStylesMock);
		});

		it('provides empty styles object from ChartItemStylesProvider', async () => {
			const mockChartItemStylesProvider = () => {
				return { some: {} };
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getRoadTypeStyles();

			expect(styles).toEqual({});
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

			expect(styles).toEqual(surfaceStylesMock);
		});

		it('provides empty styles object from ChartItemStylesProvider', async () => {
			const mockChartItemStylesProvider = () => {
				return { some: {} };
			};
			const instanceUnderTest = setup(async () => {}, null, mockChartItemStylesProvider);
			await instanceUnderTest.init();

			const styles = instanceUnderTest.getSurfaceTypeStyles();

			expect(styles).toEqual({});
		});
	});

	describe('mapOsmRoadTypes', () => {
		it('provides OSM road type mapping', async () => {
			const mappedTypes = { foo: 'baz' };
			const mockOsmRoadTypeMappingProvider = jasmine.createSpy().withArgs({ foo: 'bar' }).and.returnValue(mappedTypes);
			const instanceUnderTest = setup(null, null, null, mockOsmRoadTypeMappingProvider);

			const parameter = { foo: 'bar' };
			const mapped = instanceUnderTest.mapOsmRoadTypes(parameter);
			expect(mapped).toBe(mappedTypes);
		});
	});
});
