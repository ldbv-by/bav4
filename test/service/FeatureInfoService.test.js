import { $injector } from '../../src/injection';
import { WmsGeoResource } from '../../src/domain/geoResources';
import { FeatureInfoService } from '../../src/services/FeatureInfoService';
import { loadBvvFeatureInfo } from '../../src/services/provider/featureInfo.provider';

describe('FeatureInfoService', () => {
	const geoResourceService = {
		byId: () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('GeoResourceService', geoResourceService);
	});

	const setup = (provider = loadBvvFeatureInfo) => {
		return new FeatureInfoService(provider);
	};

	describe('constructor', () => {
		it('initializes the service with a default provider', async () => {
			const instanceUnderTest = new FeatureInfoService();
			expect(instanceUnderTest._featureInfoProvider).toEqual(loadBvvFeatureInfo);
		});

		it('initializes the service with custom provider', async () => {
			const customProvider = async () => {};
			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._featureInfoProvider).toBeDefined();
			expect(instanceUnderTest._featureInfoProvider).toEqual(customProvider);
		});
	});

	describe('get', () => {
		it('provides a FeatureInfoResult', async () => {
			const geoResourceId = 'id';
			const coordinate = [21, 42];
			const resolution = 5;
			const timestamp = '1900';
			const featureInfoResultMock = { content: 'content', title: 'title' };
			const providerSpy = jasmine.createSpy().withArgs(geoResourceId, coordinate, resolution, timestamp).and.resolveTo(featureInfoResultMock);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(new WmsGeoResource(geoResourceId));
			const instanceUnderTest = setup(providerSpy);

			const featureInfoResult = await instanceUnderTest.get(geoResourceId, coordinate, resolution, timestamp);

			expect(featureInfoResult).toEqual(featureInfoResultMock);
			expect(providerSpy).toHaveBeenCalled();
		});

		it('returns NULL when GeoResource is not queryable', async () => {
			const geoResourceId = 'id';
			const coordinate = [21, 42];
			const resolution = 5;
			const timestamp = '1900';
			const featureInfoResultMock = { content: 'content', title: 'title' };
			const providerSpy = jasmine.createSpy().withArgs(geoResourceId, coordinate, resolution, timestamp).and.resolveTo(featureInfoResultMock);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(new WmsGeoResource(geoResourceId).setQueryable(false));
			const instanceUnderTest = setup(providerSpy);

			const featureInfoResult = await instanceUnderTest.get(geoResourceId, coordinate, resolution, timestamp);

			expect(featureInfoResult).toBeNull();
			expect(providerSpy).not.toHaveBeenCalled();
		});

		it('throws an exception when provider throws one', async () => {
			const geoResourceId = 'id';
			const coordinate = [21, 42];
			const resolution = 5;
			const timestamp = '1900';
			const errorMessage = 'something got wrong';
			const providerSpy = jasmine
				.createSpy()
				.withArgs(geoResourceId, coordinate, resolution, timestamp)
				.and.returnValue(Promise.reject(errorMessage));
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(new WmsGeoResource(geoResourceId));
			const instanceUnderTest = setup(providerSpy);

			await expectAsync(instanceUnderTest.get(geoResourceId, coordinate, resolution, timestamp)).toBeRejectedWithError(
				`Could not load a FeatureInfoResult from provider: ${errorMessage}`
			);
		});
	});
});
