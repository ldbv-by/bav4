import { $injector } from '../../../../../src/injection';
import { SearchResultTypes } from '../../../../../src/modules/search/services/domain/searchResult';
import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults } from '../../../../../src/modules/search/services/provider/searchResult.provider';

describe('SearchResult provider', () => {

	const configService = {
		getValue: () => { },
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	describe('Bvv SearchResult provider for locations', () => {
		const mockResponse = { 'results': [{ 'id': '6f5a389c-4ef3-4b5a-9916-475fd5c5962b', 'weight': 0, 'attrs': { 'origin': 'layer', 'lang': 'de', 'detail': 'Kartierung der bekannten Bodendenkmäler nach Art.1 Abs.4 u. Art.2 BayDSchG (Denkmalliste). Die Zahl der tatsächlich vorhandenen Bodendenkmäler kann höher sein. Die Denkmaleigenschaft hängt nicht von der Kartierung und der Eintragung in die Bayerische Denkmalliste ab. Auch Objekte, die nicht in der Bayerischen Denkmalliste verzeichnet sind, können Denkmäler sein, wenn sie die Kriterien nach Art.1 BayDSchG erfüllen. Bei allen Vorhaben ist eine frühzeitige Beteiligung des Bayerischen Landesamtes für Denkmalpflege nach Art.7 BayDSchG notwendig.', 'layer': '6f5a389c-4ef3-4b5a-9916-475fd5c5962b', 'label': 'Bodendenkmal' } }, { 'id': '9d0e3859-be17-4a40-b439-1ba19b45fbb8', 'weight': 0, 'attrs': { 'origin': 'layer', 'lang': 'de', 'detail': 'Landschaftsprägende Denkmale sind solche Bau- und Bodendenkmale oder Ensembles, deren optische und/oder funktionale Wirkung in einen größeren, als Landschaft zu beschreibenden Raum hinausgeht. Damit ist ihre Umgebung für ihr Erscheinungsbild, Wesen und Wirkung von hoher Bedeutung. Eine Veränderung ihrer Umgebung durch neue bauliche Anlagen berührt damit das Denkmal und ist so nach Art 6. (1) 2 und Art. 7 (4)  DSchG erlaubnispflichtig. Raumwirksame Planungen, insbesondere im Energie-,  Gewerbe- und Verkehrssektor berühren häufig landschaftsprägende Denkmale. Die Stellungnahme der Denkmalpflege als Träger öffentlicher Belange ist in diesen Fällen einzuholen.', 'layer': '9d0e3859-be17-4a40-b439-1ba19b45fbb8', 'label': 'Landschaftsprägendes Denkmal' } }] };

		it('loads SearchResults for georesources', async () => {
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = backendUrl + 'search/type/layers/searchText/some';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						mockResponse
					)
				)
			));

			const searchResults = await loadBvvGeoResourceSearchResults('some');

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult = searchResults[0];


			expect(searchResult.id).toBe('6f5a389c-4ef3-4b5a-9916-475fd5c5962b');
			expect(searchResult.label).toBe('Bodendenkmal');
			expect(searchResult.labelFormated).toBe('Bodendenkmal');
			expect(searchResult.type).toBe(SearchResultTypes.GEORESOURCE);
			expect(searchResult.center).toBeNull();
			expect(searchResult.extent).toBeNull();
		});
        
		it('rejects when backend request cannot be fulfilled', (done) => {

			const backendUrl = 'https://backend.url';
			const expectedArgs0 = backendUrl + 'search/type/layers/searchText/some';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));


			loadBvvGeoResourceSearchResults('some').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe('SearchResults for georesources could not be retrieved');
				done();
			});
		});


	});
	describe('Bvv SearchResult provider for locations', () => {

		const mockResponse = { 'results': [{ 'attrs': { 'bbox': [10.268321055918932, 48.441788353957236, 10.271912282332778, 48.450982798822224], 'x': 10.270116669125855, 'y': 48.44638557638974, 'label': '<b>Wasserburger</b> <b>Weg</b>, Günzburg' } }, { 'attrs': { 'bbox': [10.256737181916833, 48.43567497096956, 10.258241482079029, 48.436685535125434], 'x': 10.257489331997931, 'y': 48.436180253047496, 'label': '<b>Wasserburger</b> <b>Weg</b>, Bubesheim' } }, { 'attrs': { 'bbox': [10.279701417312026, 48.409654651768506, 10.280982004478574, 48.4118413226679], 'x': 10.2803417108953, 'y': 48.4107479872182, 'label': '<b>Wasserburger</b> <b>Weg</b>, Kötz - Großkötz' } }], 'otherDocs': 0 };


		it('loads SearchResults for locations', async () => {

			const expectedArgs0 = 'https://geoservices.bayern.de/services/ortssuche/v1/adressen/some?srid=4326&api_key=42';
			const configServiceSpy = spyOn(configService, 'getValue').withArgs('SEARCH_SERVICE_API_KEY').and.returnValue('42');
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
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
			expect(searchResult.extent).toBeNull();

		});


		it('rejects when backend request cannot be fulfilled', (done) => {

			const expectedArgs0 = 'https://geoservices.bayern.de/services/ortssuche/v1/adressen/some?srid=4326&api_key=42';
			const configServiceSpy = spyOn(configService, 'getValue').withArgs('SEARCH_SERVICE_API_KEY').and.returnValue('42');
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));


			loadBvvLocationSearchResults('some').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe('SearchResults for locations could not be retrieved');
				done();
			});
		});
	});
});