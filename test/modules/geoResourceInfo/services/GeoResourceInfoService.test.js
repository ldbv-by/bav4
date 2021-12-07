import { GeoResourceInfoService, GeoResourceInfoResult } from '../../../../src/modules/geoResourceInfo/services/GeoResourceInfoService';
import { loadBvvGeoResourceInfo } from '../../../../src/modules/geoResourceInfo/services/provider/geoResourceInfoResult.provider';
import { $injector } from '../../../../src/injection';
import { FALLBACK_GEORESOURCE_ID_0, FALLBACK_GEORESOURCE_ID_1 } from '../../../../src/services/GeoResourceService';

const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';

const environmentService = {
	isStandalone: () => { }
};

beforeAll(() => {
	$injector
		.registerSingleton('EnvironmentService', environmentService);
});

describe('GeoResourceInfoService', () => {

	it('initializes the service with default provider', async () => {

		const geoResourceInfoService = new GeoResourceInfoService();

		expect(geoResourceInfoService._provider).toEqual(loadBvvGeoResourceInfo);
	});

	it('initializes the service with custom provider', async () => {
		const customProvider = async () => { };
		const instanceUnderTest = new GeoResourceInfoService(customProvider);
		expect(instanceUnderTest._provider).toBeDefined();
		expect(instanceUnderTest._provider).toEqual(customProvider);
	});


	it('should return a GeoResourceInfoResult with html content', async () => {

		const loadMockBvvGeoResourceInfo = async () => {
			return new GeoResourceInfoResult('<b>content</b>');
		};
		const geoResourceInfoSerice = new GeoResourceInfoService(loadMockBvvGeoResourceInfo);

		const geoResourceInfoResult = await geoResourceInfoSerice.byId(geoResourceId);

		expect(geoResourceInfoResult.content).toBe('<b>content</b>');
		expect(geoResourceInfoResult.title).toBeNull();
	});

	it('should return null when backend provides empty payload', async () => {

		const loadMockBvvGeoResourceInfo = async () => {
			return null;
		};
		const geoResourceInfoSerice = new GeoResourceInfoService(loadMockBvvGeoResourceInfo);

		const result = await geoResourceInfoSerice.byId(geoResourceId);
		expect(result).toBeNull();
	});

	it('should throw error when backend provides unknown respone', async () => {

		const providerErrMsg = 'GeoResourceInfo for \'914c9263-5312-453e-b3eb-5104db1bf788\' could not be loaded';
		const loadMockBvvGeoResourceInfo = async () => {
			return Promise.reject(new Error(providerErrMsg));
		};
		const geoResourceInfoSerice = new GeoResourceInfoService(loadMockBvvGeoResourceInfo);

		try {
			await geoResourceInfoSerice.byId(geoResourceId);
			throw new Error('Promise should not be resolved');
		}
		catch (err) {
			expect(err.message).toBe('Could not load geoResourceInfoResult from provider: ' + providerErrMsg);
		}
	});

	describe('GeoResourceInfoResult', () => {

		it('provides getter for properties', () => {
			const geoResourceInfoResult = new GeoResourceInfoResult('<b>content</b>', 'title');

			expect(geoResourceInfoResult.content).toBe('<b>content</b>');
			expect(geoResourceInfoResult.title).toBe('title');
		});

		it('provides default properties', () => {
			const geoResourceInfoResult = new GeoResourceInfoResult('<b>content</b>');

			expect(geoResourceInfoResult.content).toBe('<b>content</b>');
			expect(geoResourceInfoResult.title).toBeNull();
		});
	});

	describe('provider cannot fulfill', () => {

		it('loads fallback atkis when we are in standalone mode', async () => {
			spyOn(environmentService, 'isStandalone').and.returnValue(true);

			const providerErrMsg = 'GeoResourceInfo for \'914c9263-5312-453e-b3eb-5104db1bf788\' could not be loaded';
			const loadMockBvvGeoResourceInfo = async () => {
				return Promise.reject(new Error(providerErrMsg));
			};
			const warnSpy = spyOn(console, 'warn');
			const geoResourceInfoSerice = new GeoResourceInfoService(loadMockBvvGeoResourceInfo);
			const geoResourceInfoResult = await geoResourceInfoSerice.byId(FALLBACK_GEORESOURCE_ID_0);


			expect(geoResourceInfoResult.content).toBe('This is a fallback georesourceinfo');
			expect(geoResourceInfoResult.title).toBe(FALLBACK_GEORESOURCE_ID_0);
			expect(warnSpy).toHaveBeenCalledWith('georesourceinfo could not be fetched from backend. Using fallback georesourceinfo');
		});

		it('loads fallback atkis_sw when we are in standalone mode', async () => {
			spyOn(environmentService, 'isStandalone').and.returnValue(true);

			const providerErrMsg = 'GeoResourceInfo for \'914c9263-5312-453e-b3eb-5104db1bf788\' could not be loaded';
			const loadMockBvvGeoResourceInfo = async () => {
				return Promise.reject(new Error(providerErrMsg));
			};
			const warnSpy = spyOn(console, 'warn');
			const geoResourceInfoSerice = new GeoResourceInfoService(loadMockBvvGeoResourceInfo);
			const geoResourceInfoResult = await geoResourceInfoSerice.byId(FALLBACK_GEORESOURCE_ID_1);


			expect(geoResourceInfoResult.content).toBe('This is a fallback georesourceinfo');
			expect(geoResourceInfoResult.title).toBe(FALLBACK_GEORESOURCE_ID_1);
			expect(warnSpy).toHaveBeenCalledWith('georesourceinfo could not be fetched from backend. Using fallback georesourceinfo');
		});

		it('logs an error when we are NOT in standalone mode', async () => {
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			const providerErrMsg = 'GeoResourceInfo for \'914c9263-5312-453e-b3eb-5104db1bf788\' could not be loaded';
			const loadMockBvvGeoResourceInfo = async () => {
				return Promise.reject(new Error(providerErrMsg));
			};
			const geoResourceInfoSerice = new GeoResourceInfoService(loadMockBvvGeoResourceInfo);

			try {
				await geoResourceInfoSerice.byId(geoResourceId);
				throw new Error('Promise should not be resolved');
			}
			catch (err) {
				expect(err.message).toBe('Could not load geoResourceInfoResult from provider: ' + providerErrMsg);
			}
		});

		it('just provides geoResourceInfoResult when geoResourceId already available in locale cache', async () => {
			const geoResourceInfoSerice = new GeoResourceInfoService(null);
			const geoResourceInfo = new GeoResourceInfoResult('<b>content</b>');
			geoResourceInfoSerice._geoResourceInfoResults.set(FALLBACK_GEORESOURCE_ID_0, geoResourceInfo);

			const geoResourceInfoResult = await geoResourceInfoSerice.byId(FALLBACK_GEORESOURCE_ID_0);

			expect(geoResourceInfoResult instanceof GeoResourceInfoResult);
			expect(geoResourceInfoResult.content).toBe('<b>content</b>');
			expect(geoResourceInfoResult.title).toBe(null);
		});

		it('just provides geoResourceInfoResult when geoResourceId not available in locale cache', async () => {
			const loadMockBvvGeoResourceInfo = async () => {
				return new GeoResourceInfoResult('<div><content/div>');
			};
			const geoResourceInfoSerice = new GeoResourceInfoService(loadMockBvvGeoResourceInfo);
			geoResourceInfoSerice._geoResourceInfoResults.set(FALLBACK_GEORESOURCE_ID_1, null);

			const geoResourceInfoResult = await geoResourceInfoSerice.byId(FALLBACK_GEORESOURCE_ID_0);

			expect(geoResourceInfoResult instanceof GeoResourceInfoResult);
			expect(geoResourceInfoResult.content).toBe('<div><content/div>');
			expect(geoResourceInfoResult.title).toBe(null);
		});
	});
});
