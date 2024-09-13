import { $injector } from '../../../src/injection';
import { GeoResourceAuthenticationType, WmsGeoResource, XyzGeoResource } from '../../../src/domain/geoResources';
import { MediaType } from '../../../src/domain/mediaTypes';
import { loadBvvFeatureInfo } from '../../../src/services/provider/featureInfo.provider';
import { TestUtils } from '../../test-utils';
import { positionReducer } from '../../../src/store/position/position.reducer';
import { FeatureInfoGeometryTypes } from '../../../src/domain/featureInfo';

describe('FeatureInfoResult provider', () => {
	describe('Bvv FeatureInfoResult provider', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			post: async () => {}
		};

		const responseInterceptor = () => {};
		const geoResourceService = {
			byId: () => {},
			getAuthResponseInterceptorForGeoResource: () => responseInterceptor
		};

		const baaCredentialService = {
			get: () => {}
		};

		const zoomLevel = 4.6;

		beforeEach(() => {
			TestUtils.setupStoreAndDi(
				{
					position: {
						zoom:zoomLevel
					}
				},
				{ position: positionReducer }
			);
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('GeoResourceService', geoResourceService)
				.registerSingleton('BaaCredentialService', baaCredentialService);
		});

		describe('WmsGeoResource', () => {
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
					urlOrId: geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					srid: 3857,
					resolution: mapResolution
				});
				const featureInfoResultPayload = { title: title, content: 'content' };
				const authServiceSpy = spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').and.returnValue(responseInterceptor);
				const httpServiceSpy = spyOn(httpService, 'post')
					.withArgs(
						`${backendUrl}getFeature/${geoResourceId}`,
						expectedRequestPayload,
						MediaType.JSON,
						{ timeout: 10000 },
						{ response: [responseInterceptor] }
					)
					.and.resolveTo(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(title);
				expect(authServiceSpy).toHaveBeenCalledOnceWith(geoResourceId);
			});

			it('takes the GeoResource label as default title', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'label';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, geoResourceLabel, '', '', '');
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const content = 'content';
				spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
				const expectedRequestPayload = JSON.stringify({
					urlOrId: geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					srid: 3857,
					resolution: mapResolution
				});
				const featureInfoResultPayload = { title: null, content: 'content' };
				spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').and.returnValue(responseInterceptor);
				spyOn(httpService, 'post')
					.withArgs(
						`${backendUrl}getFeature/${geoResourceId}`,
						expectedRequestPayload,
						MediaType.JSON,
						{ timeout: 10000 },
						{ response: [responseInterceptor] }
					)
					.and.resolveTo(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(geoResourceLabel);
			});

			it('loads a FeatureInfoResult for an external WmsGeoResource', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'https://foo.bar/geoResourceId';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, '', '', '', '');
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const content = 'content';
				const title = 'title';
				const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
				const expectedRequestPayload = JSON.stringify({
					urlOrId: geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					srid: 3857,
					resolution: mapResolution
				});
				const featureInfoResultPayload = { title: title, content: 'content' };
				const httpServiceSpy = spyOn(httpService, 'post')
					.withArgs(`${backendUrl}getFeature/url`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 }, { response: [] })
					.and.resolveTo(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(title);
			});

			it('loads a FeatureInfoResult for a imported and BAA restricted WmsGeoResource', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'https://foo.bar/geoResourceId';
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
					urlOrId: geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					srid: 3857,
					resolution: mapResolution,
					username: credential.username,
					password: credential.password
				});
				const featureInfoResultPayload = { title: title, content: 'content' };
				const httpServiceSpy = spyOn(httpService, 'post')
					.withArgs(`${backendUrl}getFeature/url`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 }, { response: [] })
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
					`FeatureInfoResult for '${geoResourceId}' could not be loaded: No credentials available`
				);
			});

			it('return NULL when no content is available', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const wmsGeoResource = new WmsGeoResource(geoResourceId, '', '', '', '');
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
				const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				const httpServiceSpy = spyOn(httpService, 'post').and.resolveTo(new Response(null, { status: 204 }));

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
				const httpServiceSpy = spyOn(httpService, 'post').and.resolveTo(new Response(null, { status: 500 }));

				await expectAsync(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution)).toBeRejectedWithError(
					`FeatureInfoResult for '${geoResourceId}' could not be loaded: Http-Status 500`
				);
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
			});
		});

		describe('Any GeoResource containing timestamps', () => {
			it('loads a FeatureInfoResult including a geometry', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'label';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, geoResourceLabel, '').setTimestamps([1900]);
				const coordinate3857 = [38, 57];
				const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
				const mapResolution = 5;
				const content = 'content';
				const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(xyzGeoResource);
				const expectedRequestPayload = JSON.stringify({
					geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					zoom: Math.round(zoomLevel),
					year: 1925
				});
				const featureInfoResultPayload = { fragment: 'content', geometry: geoJson };
				const httpServiceSpy = spyOn(httpService, 'post')
					.withArgs(`${backendUrl}timetravel`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 })
					.and.resolveTo(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(geoResourceLabel);
				expect(featureInfoResult.geometry.data).toBe(geoJson);
				expect(featureInfoResult.geometry.geometryType).toBe(FeatureInfoGeometryTypes.GEOJSON);
			});

			it('loads a FeatureInfoResult without a geometry', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'label';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, geoResourceLabel, '').setTimestamps([1900]);
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const content = 'content';
				const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(xyzGeoResource);
				const expectedRequestPayload = JSON.stringify({
					geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					zoom: Math.round(zoomLevel),
					year: 1925
				});
				const featureInfoResultPayload = { fragment: 'content' };
				const httpServiceSpy = spyOn(httpService, 'post')
					.withArgs(`${backendUrl}timetravel`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 })
					.and.resolveTo(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(geoResourceLabel);
				expect(featureInfoResult.geometry).toBeNull();
			});

			it('return NULL when no content is available', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const xyzGeoResource = new XyzGeoResource(geoResourceId, '', '').setTimestamps([1900]);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(xyzGeoResource);
				const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				const httpServiceSpy = spyOn(httpService, 'post').and.resolveTo(new Response(null, { status: 204 }));

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
				const xyzGeoResource = new XyzGeoResource(geoResourceId, '', '').setTimestamps([1900]);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(xyzGeoResource);
				const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				const httpServiceSpy = spyOn(httpService, 'post').and.resolveTo(new Response(null, { status: 500 }));

				await expectAsync(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution)).toBeRejectedWithError(
					`FeatureInfoResult for '${geoResourceId}' could not be loaded: Http-Status 500`
				);
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
			});

			it('return NULL when GeoResource is not supported', async () => {
				const geoResourceId = 'geoResourceId';
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const xyzGeoResource = new XyzGeoResource(geoResourceId, '', '');
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(xyzGeoResource);

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution);

				expect(featureInfoResult).toBeNull;
			});
		});

		it('throws an exception when GeoResourceService cannot fulfill', async () => {
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);

			await expectAsync(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution)).toBeRejectedWithError(
				`FeatureInfoResult for '${geoResourceId}' could not be loaded: No GeoResource found with id "geoResourceId"`
			);
		});
	});
});
