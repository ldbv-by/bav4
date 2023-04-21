import { MapFeedbackService } from '../../src/services/MapFeedbackService';
import { bvvMapFeedbackCategoriesProvider, bvvMapFeedbackStorageProvider } from '../../src/services/provider/mapFeedbackStorage.provider';

describe('MapFeedbackService', () => {
	const setup = (mapFeedbackStorageProvider = bvvMapFeedbackStorageProvider, mapFeedbackCategoriesProvider = bvvMapFeedbackCategoriesProvider) => {
		return new MapFeedbackService(mapFeedbackStorageProvider, mapFeedbackCategoriesProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			const instanceUnderTest = new MapFeedbackService();
			expect(instanceUnderTest._mapFeedbackStorageProvider).toEqual(bvvMapFeedbackStorageProvider);
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
			const mockFeedback = { foo: 'bar' };
			const customMapFeedbackStorageProvider = jasmine.createSpy().withArgs(mockFeedback).and.resolveTo(true);
			const instanceUnderTest = setup(customMapFeedbackStorageProvider);

			await expectAsync(instanceUnderTest.save(mockFeedback)).toBeResolvedTo(true);
		});

		it('rejects when the provider rejects', async () => {
			const mockFeedback = { foo: 'bar' };
			const customMapFeedbackStorageProvider = jasmine.createSpy().withArgs(mockFeedback).and.rejectWith('Error');
			const instanceUnderTest = setup(customMapFeedbackStorageProvider);

			await expectAsync(instanceUnderTest.save(mockFeedback)).toBeRejectedWith('Error');
		});
	});
});
