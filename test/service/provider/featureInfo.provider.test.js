import { $injector } from '../../../src/injection';
import { GeoResourceAuthenticationType, WmsGeoResource } from '../../../src/domain/geoResources';
import { MediaType } from '../../../src/domain/mediaTypes';
import { loadBvvFeatureInfo } from '../../../src/services/provider/featureInfo.provider';

describe('FeatureInfoResult provider', () => {
	describe('Bvv FeatureInfoResult provider', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			post: async () => {}
		};

		const geoResourceService = {
			byId: () => {}
		};

		const baaCredentialService = {
			get: () => {}
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('GeoResourceService', geoResourceService)
				.registerSingleton('BaaCredentialService', baaCredentialService);
		});

		it('loads a FeatureInfoResult for a default WmsGeoResource', async () => {
			const backendUrl = 'https://backend.url/';
			const geoResourceId = 'geoResourceId';
			const wmsGeoResource = new WmsGeoResource(geoResourceId, '', '', '', '');
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const content = 'content';
			const title = 'title';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
			const expectedRequestPayload = JSON.stringify({
				id: geoResourceId,
				easting: coordinate3857[0],
				northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution
			});
			const featureInfoResultPayload = { title: title, content: 'content' };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(`${backendUrl}getFeature`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 })
				.and.resolveTo(new Response(JSON.stringify(featureInfoResultPayload)));

			const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(featureInfoResult.content).toBe(content);
			expect(featureInfoResult.title).toBe(title);
		});

		it('loads a FeatureInfoResult for a imported and BAA restricted WmsGeoResource', async () => {
			const backendUrl = 'https://backend.url/';
			const geoResourceId = 'geoResourceId';
			const geoResourceUrl = 'url';
			const geoResourceLayer = 'layer';
			const credential = {
				username: 'u',
				password: 'p'
			};
			const wmsGeoResource = new WmsGeoResource(geoResourceId, '', geoResourceUrl, geoResourceLayer, '').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const content = 'content';
			const title = 'title';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
			spyOn(baaCredentialService, 'get').withArgs(geoResourceUrl).and.returnValue(credential);
			const expectedRequestPayload = JSON.stringify({
				id: geoResourceId,
				easting: coordinate3857[0],
				northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution,
				username: credential.username,
				password: credential.password
			});
			const featureInfoResultPayload = { title: title, content: 'content' };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(`${backendUrl}getFeature`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 })
				.and.resolveTo(new Response(JSON.stringify(featureInfoResultPayload)));

			const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(featureInfoResult.content).toBe(content);
			expect(featureInfoResult.title).toBe(title);
		});

		it('throws an error when BaaCredentialService cannot fulfill', async () => {
			const geoResourceId = 'geoResourceId';
			const geoResourceUrl = 'url';
			const geoResourceLayer = 'layer';

			const wmsGeoResource = new WmsGeoResource(geoResourceId, '', geoResourceUrl, geoResourceLayer, '').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
			spyOn(baaCredentialService, 'get').withArgs(geoResourceUrl).and.returnValue(null);

			await expectAsync(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution)).toBeRejectedWithError(
				'FeatureInfoResult could not be retrieved'
			);
		});

		it('returns Null when no content is available', async () => {
			const backendUrl = 'https://backend.url/';
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const wmsGeoResource = new WmsGeoResource(geoResourceId, '', '', '', '');
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedRequestPayload = JSON.stringify({
				id: geoResourceId,
				easting: coordinate3857[0],
				northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution
			});
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(`${backendUrl}getFeature`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 })
				.and.resolveTo(new Response(null, { status: 204 }));

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
			const wmsGeoResource = new WmsGeoResource(geoResourceId, '', '', '', '');
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedRequestPayload = JSON.stringify({
				id: geoResourceId,
				easting: coordinate3857[0],
				northing: coordinate3857[1],
				srid: 3857,
				resolution: mapResolution
			});
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(`${backendUrl}getFeature`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 })
				.and.resolveTo(new Response(null, { status: 500 }));

			await expectAsync(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution)).toBeRejectedWithError(
				'FeatureInfoResult could not be retrieved'
			);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('throws an exception when GeoResourceService cannot fulfill', async () => {
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);

			await expectAsync(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution)).toBeRejectedWithError(
				'FeatureInfoResult could not be retrieved'
			);
		});
	});
});
