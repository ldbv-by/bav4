import { $injector } from '../../../../../src/injection';
import { SearchResultTypes } from '../../../../../src/modules/search/services/domain/searchResult';
import { loadBvvCadastralParcelSearchResults, loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults } from '../../../../../src/modules/search/services/provider/searchResult.provider';

describe('SearchResult provider', () => {

	const configService = {
		getValue: () => { },
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

	describe('Bvv SearchResult provider for GeoResources', () => {

		const mockResponse = [
			{ 'id': '6f5a389c-4ef3-4b5a-9916-475fd5c5962b', 'attrs': { 'detail': 'Kartierung der bekannten Bodendenkmäler nach Art.1 Abs.4 u. Art.2 BayDSchG (Denkmalliste). Die Zahl der tatsächlich vorhandenen Bodendenkmäler kann höher sein. Die Denkmaleigenschaft hängt nicht von der Kartierung und der Eintragung in die Bayerische Denkmalliste ab. Auch Objekte, die nicht in der Bayerischen Denkmalliste verzeichnet sind, können Denkmäler sein, wenn sie die Kriterien nach Art.1 BayDSchG erfüllen. Bei allen Vorhaben ist eine frühzeitige Beteiligung des Bayerischen Landesamtes für Denkmalpflege nach Art.7 BayDSchG notwendig.', 'layer': '6f5a389c-4ef3-4b5a-9916-475fd5c5962b', 'label': '<b>Bodendenkmal</b>' } },
			{ 'id': '9d0e3859-be17-4a40-b439-1ba19b45fbb8', 'attrs': { 'detail': 'Landschaftsprägende Denkmale sind solche Bau- und Bodendenkmale oder Ensembles, deren optische und/oder funktionale Wirkung in einen größeren, als Landschaft zu beschreibenden Raum hinausgeht. Damit ist ihre Umgebung für ihr Erscheinungsbild, Wesen und Wirkung von hoher Bedeutung. Eine Veränderung ihrer Umgebung durch neue bauliche Anlagen berührt damit das Denkmal und ist so nach Art 6. (1) 2 und Art. 7 (4)  DSchG erlaubnispflichtig. Raumwirksame Planungen, insbesondere im Energie-,  Gewerbe- und Verkehrssektor berühren häufig landschaftsprägende Denkmale. Die Stellungnahme der Denkmalpflege als Träger öffentlicher Belange ist in diesen Fällen einzuholen.', 'layer': '9d0e3859-be17-4a40-b439-1ba19b45fbb8', 'label': '<b>Landschaftsprägendes</b> Denkmal' } }
		];

		it('loads SearchResults for georesources', async () => {
			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/layers/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						mockResponse
					)
				)
			));

			const searchResults = await loadBvvGeoResourceSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult = searchResults[0];


			expect(searchResult.id).toBe('6f5a389c-4ef3-4b5a-9916-475fd5c5962b');
			expect(searchResult.label).toBe('Bodendenkmal');
			expect(searchResult.labelFormated).toBe('<b>Bodendenkmal</b>');
			expect(searchResult.type).toBe(SearchResultTypes.GEORESOURCE);
			expect(searchResult.center).toBeNull();
			expect(searchResult.extent).toBeNull();
		});

		it('returns an empty array when response is empty', async () => {
			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/layers/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						[]
					)
				)
			));

			const searchResults = await loadBvvGeoResourceSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(0);
		});

		it('rejects when backend request cannot be fulfilled', async () => {

			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/layers/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			try {
				await loadBvvGeoResourceSearchResults(term);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('SearchResults for georesources could not be retrieved');
			}
		});
	});

	describe('Bvv SearchResult provider for locations', () => {

		const mockResponse = [
			{ id: 'id0', attrs: { extent: [10.268321055918932, 48.441788353957236, 10.271912282332778, 48.450982798822224], coordinate: [10.270116669125855, 48.44638557638974], label: '<b>Wasserburger</b> <b>Weg</b>, Günzburg' } },
			{ id: 'id1', attrs: { coordinate: [10.257489331997931, 48.436180253047496], label: '<b>Wasserburger</b> <b>Weg</b>, Bubesheim' } }
		];

		it('loads SearchResults for locations', async () => {

			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/locations/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						mockResponse
					)
				)
			));

			const searchResults = await loadBvvLocationSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult0 = searchResults[0];

			expect(searchResult0.id).toBe('id0');
			expect(searchResult0.label).toBe('Wasserburger Weg, Günzburg');
			expect(searchResult0.labelFormated).toBe('<b>Wasserburger</b> <b>Weg</b>, Günzburg');
			expect(searchResult0.type).toBe(SearchResultTypes.LOCATION);
			expect(searchResult0.center).toEqual([10.270116669125855, 48.44638557638974]);
			expect(searchResult0.extent).toEqual([10.268321055918932, 48.441788353957236, 10.271912282332778, 48.450982798822224]);

			const searchResult1 = searchResults[1];

			expect(searchResult1.extent).toBeNull();
		});

		it('returns an empty array when response is empty', async () => {

			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/locations/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						[]
					)
				)
			));

			const searchResults = await loadBvvLocationSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(0);
		});

		it('rejects when backend request cannot be fulfilled', async () => {

			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/locations/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			try {
				await loadBvvLocationSearchResults(term);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('SearchResults for locations could not be retrieved');
			}
		});
	});

	describe('Bvv SearchResult provider for cadastrial parcels', () => {

		const mockResponse = [
			{ id: 'id0', attrs: { coordinate: [10.270116669125855, 48.44638557638974], label: '<b>foo</b>, bar' } },
			{ id: 'id1', attrs: { coordinate: [10.257489331997931, 48.436180253047496], label: '<b>some</b> <b>other</b>, result' } }
		];

		it('loads SearchResults for cadastial parcels', async () => {

			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/cp/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						mockResponse
					)
				)
			));

			const searchResults = await loadBvvCadastralParcelSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult0 = searchResults[0];

			expect(searchResult0.id).toBe('id0');
			expect(searchResult0.label).toBe('foo, bar');
			expect(searchResult0.labelFormated).toBe('<b>foo</b>, bar');
			expect(searchResult0.type).toBe(SearchResultTypes.CADASTRAL_PARCEL);
			expect(searchResult0.center).toEqual([10.270116669125855, 48.44638557638974]);
			expect(searchResult0.extent).toBeNull();
		});

		it('returns an empty array when response is empty', async () => {

			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/cp/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(
						[]
					)
				)
			));

			const searchResults = await loadBvvCadastralParcelSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(0);
		});

		it('rejects when backend request cannot be fulfilled', async () => {

			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/cp/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			try {
				await loadBvvCadastralParcelSearchResults(term);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('SearchResults for cadastrial parcels could not be retrieved');
			}
		});
	});
});
