import { $injector } from '../../src/injection';
import { WmsGeoResource, WMTSGeoResource } from '../../src/services/domain/geoResources';
import { FeatureInfoResult, FeatureInfoService } from '../../src/services/FeatureInfoService';
import { loadBvvFeatureInfo } from '../../src/services/provider/featureInfo.provider';

describe('FeatureInfoService', () => {

	const geoResourceService = {
		byId: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('GeoResourceService', geoResourceService);
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

			const customProvider = async () => { };
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
			const featureInfoResultMock = new FeatureInfoResult('content', 'title');
			const providerSpy = jasmine.createSpy().withArgs(geoResourceId, coordinate, resolution).and.resolveTo(featureInfoResultMock);
			const instanceUnderTest = setup(providerSpy);
			const isQueryableSpy = spyOn(instanceUnderTest, 'isQueryable').withArgs(geoResourceId).and.returnValue(true);

			const featureInfoResult = await instanceUnderTest.get(geoResourceId, coordinate, resolution);

			expect(featureInfoResult).toEqual(featureInfoResultMock);
			expect(isQueryableSpy).toHaveBeenCalled();
			expect(providerSpy).toHaveBeenCalled();
		});

		it('returns Null when GeoResource is not queryable', async () => {

			const geoResourceId = 'id';
			const coordinate = [21, 42];
			const resolution = 5;
			const featureInfoResultMock = new FeatureInfoResult('content', 'title');
			const providerSpy = jasmine.createSpy().withArgs(geoResourceId, coordinate, resolution).and.resolveTo(featureInfoResultMock);
			const instanceUnderTest = setup(providerSpy);
			const isQueryableSpy = spyOn(instanceUnderTest, 'isQueryable').withArgs(geoResourceId).and.returnValue(false);

			const featureInfoResult = await instanceUnderTest.get(geoResourceId, coordinate, resolution);

			expect(featureInfoResult).toBeNull();
			expect(isQueryableSpy).toHaveBeenCalled();
			expect(providerSpy).not.toHaveBeenCalled();
		});

		it('throws an exception when provider throws one', async () => {

			const geoResourceId = 'id';
			const coordinate = [21, 42];
			const resolution = 5;
			const errorMessage = 'something got wrong';
			const providerSpy = jasmine.createSpy().withArgs(geoResourceId, coordinate, resolution).and.returnValue(Promise.reject(errorMessage));
			const instanceUnderTest = setup(providerSpy);
			const isQueryableSpy = spyOn(instanceUnderTest, 'isQueryable').withArgs(geoResourceId).and.returnValue(true);

			try {
				await instanceUnderTest.get(geoResourceId, coordinate, resolution);
				throw new Error('Promise should not be resolved');
			}
			catch (e) {
				expect(e.message).toBe(`Could not load a FeatureInfoResult from provider: ${errorMessage}`);
				expect(isQueryableSpy).toHaveBeenCalled();
				expect(providerSpy).toHaveBeenCalled();
			}
		});

		describe('isQueryable', () => {

			it('tests if a GeoResource is queryable', async () => {

				const geoResourceId = 'id';
				const instanceUnderTest = setup();
				const geoResourceServiceSpy = spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(new WmsGeoResource(geoResourceId));

				expect(instanceUnderTest.isQueryable(geoResourceId)).toBeTrue();

				geoResourceServiceSpy.withArgs(geoResourceId).and.returnValue(new WMTSGeoResource(geoResourceId));

				expect(instanceUnderTest.isQueryable(geoResourceId)).toBeFalse();
			});
		});
	});

	describe('FeatureInfoResult', () => {

		it('provides getter for properties', () => {

			const layerInfoResult = new FeatureInfoResult('<b>content</b>', 'title');

			expect(layerInfoResult.content).toBe('<b>content</b>');
			expect(layerInfoResult.title).toBe('title');
		});

		it('provides default properties', () => {

			const layerInfoResult = new FeatureInfoResult('<b>content</b>', undefined);

			expect(layerInfoResult.content).toBe('<b>content</b>');
			expect(layerInfoResult.title).toBeNull();
		});
	});
});
