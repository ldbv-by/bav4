import { GeneralFeedback, MapFeedback, MapFeedbackService } from '../../src/services/MapFeedbackService';
import { bvvMapFeedbackCategoriesProvider, bvvFeedbackStorageProvider } from '../../src/services/provider/feedback.provider';

describe('Entities', () => {
	it('MapFeedback', async () => {
		const instanceUnderTest = new MapFeedback('state', 'category', 'description', 'geometryId', 'email');
		expect(instanceUnderTest.state).toBe('state');
		expect(instanceUnderTest.category).toBe('category');
		expect(instanceUnderTest.description).toBe('description');
		expect(instanceUnderTest.geometryId).toBe('geometryId');
		expect(instanceUnderTest.email).toBe('email');
		expect(new MapFeedback('state', 'category', 'description', 'geometryId').email).toBeNull();
	});
	it('GeneralFeedback', async () => {
		const instanceUnderTest = new GeneralFeedback('description', 'email', 'rating');
		expect(instanceUnderTest.description).toBe('description');
		expect(instanceUnderTest.email).toBe('email');
		expect(instanceUnderTest.rating).toBe('rating');
		expect(new GeneralFeedback('description').email).toBeNull();
		expect(new GeneralFeedback('description').rating).toBeNull();
	});
});

describe('MapFeedbackService', () => {
	const setup = (mapFeedbackStorageProvider = bvvFeedbackStorageProvider, mapFeedbackCategoriesProvider = bvvMapFeedbackCategoriesProvider) => {
		return new MapFeedbackService(mapFeedbackStorageProvider, mapFeedbackCategoriesProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			const instanceUnderTest = new MapFeedbackService();
			expect(instanceUnderTest._mapFeedbackStorageProvider).toEqual(bvvFeedbackStorageProvider);
			expect(instanceUnderTest._mapFeedbackCategoriesProvider).toEqual(bvvMapFeedbackCategoriesProvider);
		});

		it('initializes the service with custom provider', async () => {
			const customMapFeedbackStorageProvider = async () => {};
			const customMapFeedbackCategoriesProvider = async () => {};
			const instanceUnderTest = setup(customMapFeedbackStorageProvider, customMapFeedbackCategoriesProvider);
			expect(instanceUnderTest._mapFeedbackStorageProvider).toEqual(customMapFeedbackStorageProvider);
			expect(instanceUnderTest._mapFeedbackCategoriesProvider).toEqual(customMapFeedbackCategoriesProvider);
		});
	});

	describe('getCategories', () => {
		it('provides categories', async () => {
			const categories = ['foo', 'bar'];
			const customMapFeedbackCategoriesProvider = jasmine.createSpy().and.resolveTo(categories);
			const instanceUnderTest = setup(null, customMapFeedbackCategoriesProvider);

			await expectAsync(instanceUnderTest.getCategories()).toBeResolvedTo(categories);
			await expectAsync(instanceUnderTest.getCategories()).toBeResolvedTo(categories); // second call served from cache
			expect(customMapFeedbackCategoriesProvider).toHaveBeenCalledTimes(1);
		});

		it('rejects when the provider rejects', async () => {
			const customMapFeedbackCategoriesProvider = jasmine.createSpy().and.rejectWith('Error');
			const instanceUnderTest = setup(null, customMapFeedbackCategoriesProvider);

			await expectAsync(instanceUnderTest.getCategories()).toBeRejectedWith('Error');
		});
	});

	describe('save', () => {
		it('saves a MapFeedback entity', async () => {
			const mockFeedback = new MapFeedback('state', 'category', 'description', 'geometryId');
			const customMapFeedbackStorageProvider = jasmine.createSpy().withArgs(mockFeedback).and.resolveTo(true);
			const instanceUnderTest = setup(customMapFeedbackStorageProvider);

			await expectAsync(instanceUnderTest.save(mockFeedback)).toBeResolvedTo(true);
		});

		it('saves a GeneralFeedback entity', async () => {
			const mockFeedback = new GeneralFeedback('description');
			const customMapFeedbackStorageProvider = jasmine.createSpy().withArgs(mockFeedback).and.resolveTo(true);
			const instanceUnderTest = setup(customMapFeedbackStorageProvider);

			await expectAsync(instanceUnderTest.save(mockFeedback)).toBeResolvedTo(true);
		});

		it('rejects when the provider rejects', async () => {
			const mockFeedback = new MapFeedback('state', 'category', 'description', 'geometryId');
			const customMapFeedbackStorageProvider = jasmine.createSpy().withArgs(mockFeedback).and.rejectWith('Error');
			const instanceUnderTest = setup(customMapFeedbackStorageProvider);

			await expectAsync(instanceUnderTest.save(mockFeedback)).toBeRejectedWith('Error');
		});

		it('resolves to "false" when no feedback object available', async () => {
			const mockFeedback = { fpp: 'bar' };
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.save(mockFeedback)).toBeResolvedTo(false);
		});
	});
});
