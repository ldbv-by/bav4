import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/services/HttpService';
import { loadBvvFeatureInfo } from '../../../src/services/provider/featureInfo.provider';

describe('FeatureInfoResult provider', () => {

	describe('Bvv FeatureInfoResult provider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			post: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});

		it('loads a FeatureInfoResult', async () => {

			const backendUrl = 'https://backend.url/';
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const content = 'content';
			const title = 'title';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedRequestPayload = JSON.stringify({
				easting: coordinate3857[0], northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution
			});
			const featureInfoResultPayload = { title: title, content: 'content' };
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(`${backendUrl}getFeature/${geoResourceId}`, expectedRequestPayload, MediaType.JSON).and.resolveTo(
				new Response(
					JSON.stringify(
						featureInfoResultPayload
					)
				)
			);

			const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(featureInfoResult.content).toBe(content);
			expect(featureInfoResult.title).toBe(title);
		});

		it('returns Null when no content is available', async () => {

			const backendUrl = 'https://backend.url/';
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedRequestPayload = JSON.stringify({
				easting: coordinate3857[0], northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution
			});
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(`${backendUrl}getFeature/${geoResourceId}`, expectedRequestPayload, MediaType.JSON).and.resolveTo(
				new Response(null, { status: 204 })
			);

			const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(featureInfoResult).toBeNull;
		});

		it('throws an exception when backend responds with other status codes', async () => {

			const backendUrl = 'https://backend.url/';
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedRequestPayload = JSON.stringify({
				easting: coordinate3857[0], northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution
			});
			const httpServiceSpy = spyOn(httpService, 'post').withArgs(`${backendUrl}getFeature/${geoResourceId}`, expectedRequestPayload, MediaType.JSON).and.resolveTo(
				new Response(null, { status: 500 })
			);

			try {
				await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);
				throw new Error('Promise should not be resolved');
			}
			catch (ex) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(ex.message).toBe('FeatureInfoResult could not be retrieved');
			}
		});
	});
});
