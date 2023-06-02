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
		const instanceUnderTest = new GeneralFeedback('category', 'description', 'email', 'rating');
		expect(instanceUnderTest.category).toBe('category');
		expect(instanceUnderTest.description).toBe('description');
		expect(instanceUnderTest.email).toBe('email');
		expect(instanceUnderTest.rating).toBe('rating');
		expect(new GeneralFeedback('category', 'description').email).toBeNull();
		expect(new GeneralFeedback('category', 'description').rating).toBeNull();
	});
});

describe('FeedbackService', () => {
	// todo - generalFeedbackCategoriesProvider
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

	describe('getMapFeedbackCategories', () => {
		it('provides categories for MapFeedback', async () => {
			const mapCategories = ['foo', 'bar'];
			const customMapFeedbackCategoriesProvider = jasmine.createSpy().and.resolveTo(mapCategories);
			const instanceUnderTest = setup(null, customMapFeedbackCategoriesProvider);

			await expectAsync(instanceUnderTest.getMapFeedbackCategories()).toBeResolvedTo(mapCategories);
			await expectAsync(instanceUnderTest.getMapFeedbackCategories()).toBeResolvedTo(mapCategories); // second call served from cache
			expect(customMapFeedbackCategoriesProvider).toHaveBeenCalledTimes(1);
		});

		it('rejects when the provider rejects', async () => {
			const customMapFeedbackCategoriesProvider = jasmine.createSpy().and.rejectWith('Error');
			const instanceUnderTest = setup(null, customMapFeedbackCategoriesProvider);

			await expectAsync(instanceUnderTest.getMapFeedbackCategories()).toBeRejectedWith('Error');
		});
	});

	describe('getGeneralFeedbackCategories', () => {
		// todo : real tests
		it('provides categories for GeneralFeedback', async () => {
			const generalCategories = ['Verbesserungsvorschlag', 'Technische Probleme', 'Lob und Kritik', 'Allgemein'];
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getGeneralFeedbackCategories()).toBeResolvedTo(generalCategories);
			await expectAsync(instanceUnderTest.getGeneralFeedbackCategories()).toBeResolvedTo(generalCategories);
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
			const mockFeedback = new GeneralFeedback('category', 'description');
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
