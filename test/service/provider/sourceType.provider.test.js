import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/services/HttpService';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider } from '../../../src/services/provider/sourceType.provider';
import { SourceType, SourceTypeName } from '../../../src/services/SourceTypeService';

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

		it('loads a SourceType', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const name = 'name';
			const version = 'version';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${url}`;
			const sourceTypeResultPayload = { name: 'name', version: 'version' };
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						sourceTypeResultPayload
					)
				)
			));

			const sourceTypeResult = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceTypeResult).toBeInstanceOf(SourceType);
			expect(sourceTypeResult.name).toBe(name);
			expect(sourceTypeResult.version).toBe(version);
		});

		it('returns Null when no content is available', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${url}`;
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 204 })
			));

			const sourceTypeResult = await bvvUrlSourceTypeProvider(url);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(sourceTypeResult).toBeNull;
		});

		it('throws an exception when backend responds with other status codes', async () => {

			const backendUrl = 'https://backend.url/';
			const url = 'http://foo.bar';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const expectedArgs0 = backendUrl + `sourceType?url=${url}`;
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 500 })
			));

			try {
				await bvvUrlSourceTypeProvider(url);
				throw new Error('Promise should not be resolved');
			}
			catch (ex) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(ex.message).toBe('SourceType could not be retrieved');
			}
		});
	});

	describe('defaultDataSourceTypeProvider', () => {

		it('tries to detect the source type for KML sources', () => {
			expect(defaultDataSourceTypeProvider('foo', MediaType.KML)).toEqual({ name: SourceTypeName.KML });
			expect(defaultDataSourceTypeProvider('<kml some>foo</kml>')).toEqual({ name: SourceTypeName.KML });
		});

		it('tries to detect the source type for GPX sources', () => {
			expect(defaultDataSourceTypeProvider('foo', MediaType.GPX)).toEqual({ name: SourceTypeName.GPX });
			expect(defaultDataSourceTypeProvider('<gpx some>foo</gpx>')).toEqual({ name: SourceTypeName.GPX });
		});

		it('tries to detect the source type for GeoJSON sources', () => {
			expect(defaultDataSourceTypeProvider('foo', MediaType.GeoJSON)).toEqual({ name: SourceTypeName.GeoJSON });
			expect(defaultDataSourceTypeProvider(JSON.stringify({ type: 'foo' }))).toEqual({ name: SourceTypeName.GeoJSON });
		});

		it('returns null when type can not be detected', () => {
			expect(defaultDataSourceTypeProvider('foo')).toBeNull();
			expect(defaultDataSourceTypeProvider(JSON.stringify({ some: 'foo' }))).toBeNull();
		});

		it('returns null when data is not a string', () => {
			expect(defaultDataSourceTypeProvider({})).toBeNull();
		});
	});
});
