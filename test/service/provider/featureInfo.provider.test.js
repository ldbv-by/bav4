import { $injector } from '@src/injection';
import { GeoResourceAuthenticationType, WmsGeoResource, XyzGeoResource } from '@src/domain/geoResources';
import { MediaType } from '@src/domain/mediaTypes';
import { loadBvvFeatureInfo } from '@src/services/provider/featureInfo.provider';
import { TestUtils } from '@test/test-utils';
import { positionReducer } from '@src/store/position/position.reducer';
import { SourceType } from '@src/domain/sourceType';

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
						zoom: zoomLevel
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
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const expectedRequestPayload = JSON.stringify({
					urlOrId: geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					srid: 3857,
					resolution: mapResolution
				});
				const featureInfoResultPayload = { title: title, content: 'content' };
				const authServiceSpy = vi.spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').mockReturnValue(responseInterceptor);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(
					`${backendUrl}getFeature/${geoResourceId}`,
					expectedRequestPayload,
					MediaType.JSON,
					{ timeout: 10000 },
					{ response: [responseInterceptor] }
				);
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(title);
				expect(authServiceSpy).toHaveBeenCalledWith(geoResourceId);
			});

			it('takes the GeoResource label as default title', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'label';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, geoResourceLabel, '', '', '');
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const content = 'content';
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const expectedRequestPayload = JSON.stringify({
					urlOrId: geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					srid: 3857,
					resolution: mapResolution
				});
				const featureInfoResultPayload = { title: null, content: 'content' };
				vi.spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').mockReturnValue(responseInterceptor);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(
					`${backendUrl}getFeature/${geoResourceId}`,
					expectedRequestPayload,
					MediaType.JSON,
					{ timeout: 10000 },
					{ response: [responseInterceptor] }
				);
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
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
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const expectedRequestPayload = JSON.stringify({
					urlOrId: geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					srid: 3857,
					resolution: mapResolution
				});
				const featureInfoResultPayload = { title: title, content: 'content' };
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(
					`${backendUrl}getFeature/url`,
					expectedRequestPayload,
					MediaType.JSON,
					{ timeout: 10000 },
					{ response: [] }
				);
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
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
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(credential);
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
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(
					`${backendUrl}getFeature/url`,
					expectedRequestPayload,
					MediaType.JSON,
					{ timeout: 10000 },
					{ response: [] }
				);
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
				expect(baaCredentialServiceSpy).toHaveBeenCalledWith(geoResourceUrl);
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
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(null);

				await expect(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null)).rejects.toThrow(
					`FeatureInfoResult for '${geoResourceId}' could not be loaded: No credentials available`
				);
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
				expect(baaCredentialServiceSpy).toHaveBeenCalledWith(geoResourceUrl);
			});

			it('returns NULL when no content is available', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const wmsGeoResource = new WmsGeoResource(geoResourceId, '', '', '', '');
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 204 }));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null);

				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
				expect(featureInfoResult).toBe(null);
			});

			it('throws an exception when backend responds with other status codes', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const wmsGeoResource = new WmsGeoResource(geoResourceId, '', '', '', '');
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 500 }));

				await expect(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null)).rejects.toThrow(
					`FeatureInfoResult for '${geoResourceId}' could not be loaded: Http-Status 500`
				);
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
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
				const timestamp = '1900';
				const content = 'content';
				const title = 'title';
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(xyzGeoResource);
				const expectedRequestPayload = JSON.stringify({
					geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					zoom: Math.round(zoomLevel),
					year: timestamp
				});
				const featureInfoResultPayload = { title, content, geometry: geoJson };
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, timestamp);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(`${backendUrl}timetravel`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 });
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(title);
				expect(featureInfoResult.geometry.data).toBe(geoJson);
				expect(featureInfoResult.geometry.sourceType).toEqual(SourceType.forGeoJSON());
			});

			it('loads a FeatureInfoResult without a geometry', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'label';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, geoResourceLabel, '').setTimestamps([1900]);
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const timestamp = '1900';
				const content = 'content';
				const title = 'title';
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(xyzGeoResource);
				const expectedRequestPayload = JSON.stringify({
					geoResourceId,
					easting: coordinate3857[0],
					northing: coordinate3857[1],
					zoom: Math.round(zoomLevel),
					year: timestamp
				});
				const featureInfoResultPayload = { title, content };
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(featureInfoResultPayload)));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, timestamp);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(`${backendUrl}timetravel`, expectedRequestPayload, MediaType.JSON, { timeout: 10000 });
				expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
				expect(featureInfoResult.content).toBe(content);
				expect(featureInfoResult.title).toBe(title);
				expect(featureInfoResult.geometry).toBeNull();
			});

			it('returns NULL when no content is available', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const timestamp = '1900';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, '', '').setTimestamps([1900]);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(xyzGeoResource);
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 204 }));

				const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, timestamp);

				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
				expect(featureInfoResult).toBe(null);
			});

			it('throws an exception when backend responds with other status codes', async () => {
				const backendUrl = 'https://backend.url/';
				const geoResourceId = 'geoResourceId';
				const coordinate3857 = [38, 57];
				const mapResolution = 5;
				const timestamp = '1900';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, '', '').setTimestamps([1900]);
				const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(xyzGeoResource);
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: 500 }));

				await expect(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, timestamp)).rejects.toThrow(
					`FeatureInfoResult for '${geoResourceId}' could not be loaded: Http-Status 500`
				);
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});
		});

		it('returns NULL when GeoResource is not supported', async () => {
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const xyzGeoResource = new XyzGeoResource(geoResourceId, '', '');
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(xyzGeoResource);

			const featureInfoResult = await loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null);

			expect(featureInfoResult).toBeNull;
			expect(geoResourceServiceSpy).toHaveBeenCalled();
		});

		it('throws an exception when GeoResourceService cannot fulfill', async () => {
			const geoResourceId = 'geoResourceId';
			const coordinate3857 = [38, 57];
			const mapResolution = 5;
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(null);

			await expect(loadBvvFeatureInfo(geoResourceId, coordinate3857, mapResolution, null)).rejects.toThrow(
				`FeatureInfoResult for '${geoResourceId}' could not be loaded: No GeoResource found with id "geoResourceId"`
			);
			expect(geoResourceServiceSpy).toHaveBeenCalled();
		});
	});
});
