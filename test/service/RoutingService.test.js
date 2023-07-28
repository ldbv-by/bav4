import { BvvRoutingService, mockCategoriesProvider } from '../../src/services/RoutingService';

describe('mockProvider', () => {
	it('returns the correct categories', async () => {
		const categories = await mockCategoriesProvider();
		expect(categories).toHaveSize(4);
	});
});

describe('BvvRoutingService', () => {
	const setup = (routingCategoriesProvider = mockCategoriesProvider) => {
		return new BvvRoutingService(routingCategoriesProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			const instanceUnderTest = new BvvRoutingService();
			expect(instanceUnderTest._categoriesProvider).toEqual(mockCategoriesProvider);
		});

		it('initializes the service with custom provider', async () => {
			const customRoutingCategoriesProvider = async () => {};
			const instanceUnderTest = setup(customRoutingCategoriesProvider);
			expect(instanceUnderTest._categoriesProvider).toEqual(customRoutingCategoriesProvider);
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
		it('finds the a category by its id', async () => {
			const hike = {
				id: 'hike',
				label: 'Wandern',
				subcategories: []
			};
			const bvv_hike = {
				id: 'bvv-hike',
				label: 'Wandern (Freizeitwege)',
				subcategories: [hike]
			};

			const mockCategories = [bvv_hike];
			const categoriesProvider = jasmine.createSpy().and.resolveTo(mockCategories);
			const instanceUnderTest = setup(categoriesProvider);
			await instanceUnderTest.init();

			expect(instanceUnderTest.getCategoryById('hike')).toEqual(hike);
			expect(instanceUnderTest.getCategoryById('bvv-hike')).toEqual(bvv_hike);
			expect(instanceUnderTest.getCategoryById('foo')).toBeNull();
		});
	});
});
