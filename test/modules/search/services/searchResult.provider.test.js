import { $injector } from '../../../../src/injection';
import { SearchResultTypes } from '../../../../src/modules/search/services/searchResult';
import { loadBvvLocationSearchResults } from '../../../../src/modules/search/services/searchResult.provider';

describe('SearchResult provider', () => {
	describe('Bvv SearchResult provider for locations', () => {

		const mockResponse = { 'results': [{ 'attrs': { 'bbox': [10.268321055918932, 48.441788353957236, 10.271912282332778, 48.450982798822224], 'x': 10.270116669125855, 'y': 48.44638557638974, 'label': '<b>Wasserburger</b> <b>Weg</b>, Günzburg' } }, { 'attrs': { 'bbox': [10.256737181916833, 48.43567497096956, 10.258241482079029, 48.436685535125434], 'x': 10.257489331997931, 'y': 48.436180253047496, 'label': '<b>Wasserburger</b> <b>Weg</b>, Bubesheim' } }, { 'attrs': { 'bbox': [10.279701417312026, 48.409654651768506, 10.280982004478574, 48.4118413226679], 'x': 10.2803417108953, 'y': 48.4107479872182, 'label': '<b>Wasserburger</b> <b>Weg</b>, Kötz - Großkötz' } }], 'otherDocs': 0 };

		const configService = {
			getValue: () => { }
		};

		const httpService = {
			fetch: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});


		it('loads SearchResults for locations', async () => {

			const expectedArgs0 = 'https://geoservices.bayern.de/services/ortssuche/v1/adressen/some?srid=4326&api_key=42';
			const expectedArgs1 = {
				mode: 'cors'
			};
			const configServiceSpy = spyOn(configService, 'getValue').withArgs('SEARCH_SERVICE_API_KEY').and.returnValue('42');
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						mockResponse
					)
				)
			));

			const searchResults = await loadBvvLocationSearchResults('some');

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(3);

			const searchResult = searchResults[0];


			expect(searchResult.id).toBeNull();
			expect(searchResult.label).toBe('Wasserburger Weg, Günzburg');
			expect(searchResult.labelFormated).toBe('<b>Wasserburger</b> <b>Weg</b>, Günzburg');
			expect(searchResult.type).toBe(SearchResultTypes.LOCATION);
			expect(searchResult.center).toEqual([10.270116669125855, 48.44638557638974]);
			expect(searchResult.extent).toEqual([]);

		});
		it('rejects when backend request cannot be fulfilled', (done) => {

			const expectedArgs0 = 'https://geoservices.bayern.de/services/ortssuche/v1/adressen/some?srid=4326&api_key=42';
			const expectedArgs1 = {
				mode: 'cors'
			};
			const configServiceSpy = spyOn(configService, 'getValue').withArgs('SEARCH_SERVICE_API_KEY').and.returnValue('42');
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));


			loadBvvLocationSearchResults('some').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe('SearchResults for GeoResources could not be retrieved');
				done();
			});
		});
	});
});