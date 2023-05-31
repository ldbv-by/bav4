import { GeneralFeedback, MapFeedback, FeedbackService } from '../../src/services/FeedbackService';
import {
	bvvMapFeedbackCategoriesProvider,
	bvvFeedbackStorageProvider,
	bvvMapFeedbackOverlayGeoResourceProvider
} from '../../src/services/provider/feedback.provider';

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
		expect(new GeneralFeedback().description).toBeNull();
		expect(new GeneralFeedback().email).toBeNull();
		expect(new GeneralFeedback().rating).toBeNull();
	});
});

describe('FeedbackService', () => {
	const setup = (
		mapFeedbackStorageProvider = bvvFeedbackStorageProvider,
		mapFeedbackCategoriesProvider = bvvMapFeedbackCategoriesProvider,
		mapFeedbackOverlayGeoResourceProvider = bvvMapFeedbackOverlayGeoResourceProvider
	) => {
		return new FeedbackService(mapFeedbackStorageProvider, mapFeedbackCategoriesProvider, mapFeedbackOverlayGeoResourceProvider);
	};

	describe('constructor', () => {
		it('initializes the service with default providers', async () => {
			const instanceUnderTest = new FeedbackService();
			expect(instanceUnderTest._feedbackStorageProvider).toEqual(bvvFeedbackStorageProvider);
			expect(instanceUnderTest._mapFeedbackCategoriesProvider).toEqual(bvvMapFeedbackCategoriesProvider);
			expect(instanceUnderTest._mapFeedbackOverlayGeoResourceProvider).toEqual(bvvMapFeedbackOverlayGeoResourceProvider);
		});

		it('initializes the service with custom provider', async () => {
			const customMapFeedbackStorageProvider = async () => {};
			const customMapFeedbackCategoriesProvider = async () => {};
			const customMapMapFeedbackOverlayGeoResourceProvider = async () => {};
			const instanceUnderTest = setup(
				customMapFeedbackStorageProvider,
				customMapFeedbackCategoriesProvider,
				customMapMapFeedbackOverlayGeoResourceProvider
			);
			expect(instanceUnderTest._feedbackStorageProvider).toEqual(customMapFeedbackStorageProvider);
			expect(instanceUnderTest._mapFeedbackCategoriesProvider).toEqual(customMapFeedbackCategoriesProvider);
			expect(instanceUnderTest._mapFeedbackOverlayGeoResourceProvider).toEqual(customMapMapFeedbackOverlayGeoResourceProvider);
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
	});

	describe('getOverlayGeoResourceId', () => {
		it('provides a GeoREsource id', async () => {
			const customMapFeedbackOverlayGeoResourceProvider = jasmine.createSpy().and.returnValue('foo');
			const instanceUnderTest = setup(null, null, customMapFeedbackOverlayGeoResourceProvider);

			expect(instanceUnderTest.getOverlayGeoResourceId()).toBe('foo');
		});
	});
});
