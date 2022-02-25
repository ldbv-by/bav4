import { $injector } from '../../../src/injection';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../../src/services/domain/sourceType';
import { MediaType } from '../../../src/services/HttpService';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider, defaultMediaSourceTypeProvider } from '../../../src/services/provider/sourceType.provider';

describe('sourceType provider', () => {

	describe('bvvUrlSourceTypeProvider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			get: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});

		it('returns a SourceTypeServiceResult for KML', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${encodeURIComponent(url)}`;
			const sourceTypeResultPayload = { name: 'KML', version: 'version' };
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.KML);
			expect(sourceType.version).toBe(version);
			expect(status).toEqual(SourceTypeResultStatus.OK);
		});

		it('returns a SourceTypeServiceResult for GPX', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${encodeURIComponent(url)}`;
			const sourceTypeResultPayload = { name: 'GPX', version: 'version' };
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.GPX);
			expect(sourceType.version).toBe(version);
			expect(status).toEqual(SourceTypeResultStatus.OK);
		});

		it('returns a SourceTypeServiceResult for GeoJSON', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${encodeURIComponent(url)}`;
			const sourceTypeResultPayload = { name: 'GeoJSON', version: 'version' };
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeInstanceOf(SourceType);
			expect(sourceType.name).toBe(SourceTypeName.GEOJSON);
			expect(sourceType.version).toBe(version);
			expect(status).toEqual(SourceTypeResultStatus.OK);
		});

		it('returns SourceTypeServiceResultStatus.UNSUPPORTED_TYPE_ERROR when no content is available', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${encodeURIComponent(url)}`;
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 204 })
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeNull();
			expect(status).toEqual(SourceTypeResultStatus.UNSUPPORTED_TYPE);
		});

		it('returns SourceTypeServiceResultStatus.OTHER when backend responds with other status codes', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${encodeURIComponent(url)}`;
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 500 })
			));

			const { status, sourceType } = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceType).toBeNull();
			expect(status).toEqual(SourceTypeResultStatus.OTHER);
		});
	});

	describe('defaultDataSourceTypeProvider', () => {

		it('tries to detect the source type for KML sources', () => {
			expect(defaultDataSourceTypeProvider('<kml some>foo</kml>'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
		});

		it('tries to detect the source type for GPX sources', () => {
			expect(defaultDataSourceTypeProvider('<gpx some>foo</gpx>'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX)));
		});

		it('tries to detect the source type for GeoJSON sources', () => {
			expect(defaultDataSourceTypeProvider(JSON.stringify({ type: 'foo' })))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON)));
		});

		it('returns UNSUPPORTED_TYPE when type can not be detected', () => {
			expect(defaultDataSourceTypeProvider(JSON.stringify({ some: 'foo' })))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});

		it('returns UNSUPPORTED_TYPE when data are not parseable', () => {
			const errornousJsonString = '({ some: [] )';
			expect(defaultDataSourceTypeProvider(errornousJsonString))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});

		it('returns UNSUPPORTED_TYPE when data is NOT a string', () => {
			expect(defaultDataSourceTypeProvider({}))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});
	});


	describe('defaultMediaSourceTypeProvider', () => {

		it('tries to detect the source type for KML sources', () => {
			expect(defaultMediaSourceTypeProvider(MediaType.KML))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
		});

		it('tries to detect the source type for GPX sources', () => {
			expect(defaultMediaSourceTypeProvider(MediaType.GPX))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX)));
		});

		it('tries to detect the source type for GeoJSON sources', () => {
			expect(defaultMediaSourceTypeProvider(MediaType.GeoJSON))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON)));
		});

		it('returns null when type can not be detected', () => {
			expect(defaultMediaSourceTypeProvider('foo'))
				.toEqual(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
		});
	});
});
