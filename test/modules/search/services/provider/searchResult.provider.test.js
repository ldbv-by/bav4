import { MediaType } from '../../../../../src/domain/mediaTypes';
import { SourceType, SourceTypeName } from '../../../../../src/domain/sourceType';
import { $injector } from '../../../../../src/injection';
import {
	CadastralParcelSearchResult,
	GeoResourceSearchResult,
	LocationSearchResult,
	LocationSearchResultCategory
} from '../../../../../src/modules/search/services/domain/searchResult';
import {
	loadBvvCadastralParcelSearchResults,
	loadBvvGeoResourceSearchResults,
	loadBvvLocationSearchResults,
	mapBvvLocationSearchResultTypeToCategory
} from '../../../../../src/modules/search/services/provider/searchResult.provider';

describe('SearchResult provider', () => {
	const configService = {
		getValue: () => {},
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {},
		post: async () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	describe('Bvv SearchResult provider for GeoResources', () => {
		const mockResponse = [
			{
				id: '6f5a389c-4ef3-4b5a-9916-475fd5c5962b',
				attrs: {
					detail:
						'Kartierung der bekannten Bodendenkmäler nach Art.1 Abs.4 u. Art.2 BayDSchG (Denkmalliste). Die Zahl der tatsächlich vorhandenen Bodendenkmäler kann höher sein. Die Denkmaleigenschaft hängt nicht von der Kartierung und der Eintragung in die Bayerische Denkmalliste ab. Auch Objekte, die nicht in der Bayerischen Denkmalliste verzeichnet sind, können Denkmäler sein, wenn sie die Kriterien nach Art.1 BayDSchG erfüllen. Bei allen Vorhaben ist eine frühzeitige Beteiligung des Bayerischen Landesamtes für Denkmalpflege nach Art.7 BayDSchG notwendig.',
					layer: '6f5a389c-4ef3-4b5a-9916-475fd5c5962b',
					label: '<b>Bodendenkmal</b>'
				}
			},
			{
				id: '9d0e3859-be17-4a40-b439-1ba19b45fbb8',
				attrs: {
					detail:
						'Landschaftsprägende Denkmale sind solche Bau- und Bodendenkmale oder Ensembles, deren optische und/oder funktionale Wirkung in einen größeren, als Landschaft zu beschreibenden Raum hinausgeht. Damit ist ihre Umgebung für ihr Erscheinungsbild, Wesen und Wirkung von hoher Bedeutung. Eine Veränderung ihrer Umgebung durch neue bauliche Anlagen berührt damit das Denkmal und ist so nach Art 6. (1) 2 und Art. 7 (4)  DSchG erlaubnispflichtig. Raumwirksame Planungen, insbesondere im Energie-,  Gewerbe- und Verkehrssektor berühren häufig landschaftsprägende Denkmale. Die Stellungnahme der Denkmalpflege als Träger öffentlicher Belange ist in diesen Fällen einzuholen.',
					layer: '9d0e3859-be17-4a40-b439-1ba19b45fbb8',
					label: '<b>Landschaftsprägendes</b> Denkmal'
				}
			}
		];

		it('loads SearchResults for geoResources', async () => {
			const term = 'term?/foo';
			const termReplacedAndEncoded = 'term%3F%20foo';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/georesource/searchText/${termReplacedAndEncoded}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponse))));

			const searchResults = await loadBvvGeoResourceSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult = searchResults[0];

			expect(searchResult instanceof GeoResourceSearchResult).toBeTrue();
			expect(searchResult.geoResourceId).toBe('6f5a389c-4ef3-4b5a-9916-475fd5c5962b');
			expect(searchResult.label).toBe('Bodendenkmal');
			expect(searchResult.labelFormatted).toBe('<b>Bodendenkmal</b>');
		});

		it('returns an empty array when response is empty', async () => {
			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/georesource/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify([]))));

			const searchResults = await loadBvvGeoResourceSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(0);
		});

		it('rejects when backend request cannot be fulfilled', async () => {
			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/georesource/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

			try {
				await loadBvvGeoResourceSearchResults(term);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('SearchResults for GeoResources could not be retrieved');
			}
		});
	});

	describe('mapBvvLocationSearchResultTypeToCategory', () => {
		it('maps Bvv location types to a LocationSearchResultCategory', async () => {
			expect(mapBvvLocationSearchResultTypeToCategory()).toBeNull();
			expect(mapBvvLocationSearchResultTypeToCategory('fliessgewaesser')).toBe(LocationSearchResultCategory.Waters);
			expect(mapBvvLocationSearchResultTypeToCategory('see')).toBe(LocationSearchResultCategory.Waters);
			expect(mapBvvLocationSearchResultTypeToCategory('schule')).toBe(LocationSearchResultCategory.School);
			expect(mapBvvLocationSearchResultTypeToCategory('wald')).toBe(LocationSearchResultCategory.Forest);
			expect(mapBvvLocationSearchResultTypeToCategory('berg')).toBe(LocationSearchResultCategory.Mountain);
			expect(mapBvvLocationSearchResultTypeToCategory('huette')).toBe(LocationSearchResultCategory.Hut);
			expect(mapBvvLocationSearchResultTypeToCategory('strasse_platz')).toBe(LocationSearchResultCategory.Street);
			expect(mapBvvLocationSearchResultTypeToCategory('flurname')).toBe(LocationSearchResultCategory.Landscape);
		});
	});

	describe('Bvv SearchResult provider for locations', () => {
		const mockResponse = [
			{
				id: 'id0',
				attrs: {
					extent: [10.268321055918932, 48.441788353957236, 10.271912282332778, 48.450982798822224],
					coordinate: [10.270116669125855, 48.44638557638974],
					label: '<b>Wasserburger</b> <b>Weg</b>, Günzburg',
					type: 'strasse_platz'
				}
			},
			{ id: 'id1', attrs: { coordinate: [10.257489331997931, 48.436180253047496], label: '<b>Wasserburger</b> <b>Weg</b>, Bubesheim' } }
		];

		it('loads SearchResults for locations', async () => {
			const term = 'term?/foo';
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const expectedUrl = `${backendUrl}/search/type/location/searchText`;
			const payload = { term };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(expectedUrl, JSON.stringify(payload), MediaType.JSON)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponse))));

			const searchResults = await loadBvvLocationSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult0 = searchResults[0];

			(expect(searchResult0 instanceof LocationSearchResult).toBeTrue(), expect(searchResult0.label).toBe('Wasserburger Weg, Günzburg'));
			expect(searchResult0.labelFormatted).toBe('<b>Wasserburger</b> <b>Weg</b>, Günzburg');
			expect(searchResult0.center).toEqual([10.270116669125855, 48.44638557638974]);
			expect(searchResult0.extent).toEqual([10.268321055918932, 48.441788353957236, 10.271912282332778, 48.450982798822224]);
			expect(searchResult0.id).not.toBeNull();
			expect(searchResult0.category).toBe(LocationSearchResultCategory.Street);

			const searchResult1 = searchResults[1];

			expect(searchResult1.center).toEqual([10.257489331997931, 48.436180253047496]);
			expect(searchResult1.extent).toBeNull();
			expect(searchResult1.id).not.toBeNull();
			expect(searchResult1.category).toBeNull();
		});

		it('returns an empty array when response is empty', async () => {
			const term = 'term';
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const expectedUrl = `${backendUrl}/search/type/location/searchText`;
			const payload = { term };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(expectedUrl, JSON.stringify(payload), MediaType.JSON)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify([]))));

			const searchResults = await loadBvvLocationSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(0);
		});

		it('rejects when backend request cannot be fulfilled', async () => {
			const term = 'term';
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const expectedUrl = `${backendUrl}/search/type/location/searchText`;
			const payload = { term };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(expectedUrl, JSON.stringify(payload), MediaType.JSON)
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

			try {
				await loadBvvLocationSearchResults(term);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('SearchResults for locations could not be retrieved');
			}
		});
	});

	describe('Bvv SearchResult provider for cadastral parcels', () => {
		const mockResponse = [
			{ id: 'id0', attrs: { coordinate: [10.270116669125855, 48.44638557638974], label: '<b>foo</b>, bar' } },
			{ id: 'id1', attrs: { coordinate: [10.257489331997931, 48.436180253047496], label: '<b>some</b> <b>other</b>, result' } }
		];
		const mockResponseIncludingEwkt = [
			{
				id: 'id0',
				attrs: {
					coordinate: [10.270116669125855, 48.44638557638974],
					extent: [0, 1, 2, 3],
					label: '<b>foo</b>, bar',
					ewkt: 'SRID=3857;POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))'
				}
			},
			{
				id: 'id1',
				attrs: {
					coordinate: [10.257489331997931, 48.436180253047496],
					extent: [4, 5, 6, 7],
					label: '<b>some</b> <b>other</b>, result',
					ewkt: 'SRID=3857;POLYGON ((30 10, 20 30, 20 40, 10 20, 30 10))'
				}
			}
		];

		it('loads SearchResults for cadastral parcels without a geometry', async () => {
			const term = 'term?/foo';
			const termReplacedAndEncoded = 'term%3F%20foo';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/cp/searchText/${termReplacedAndEncoded}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponse))));

			const searchResults = await loadBvvCadastralParcelSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult0 = searchResults[0];

			(expect(searchResult0 instanceof CadastralParcelSearchResult).toBeTrue(), expect(searchResult0.label).toBe('foo, bar'));
			expect(searchResult0.labelFormatted).toBe('<b>foo</b>, bar');
			expect(searchResult0.center).toEqual([10.270116669125855, 48.44638557638974]);
			expect(searchResult0.id).not.toBeNull();
		});

		it('loads SearchResults for cadastral parcels including a geometry', async () => {
			const term = 'term?/foo';
			const termReplacedAndEncoded = 'term%3F%20foo';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/cp/searchText/${termReplacedAndEncoded}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponseIncludingEwkt))));

			const searchResults = await loadBvvCadastralParcelSearchResults(term);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(searchResults.length).toBe(2);

			const searchResult0 = searchResults[0];

			(expect(searchResult0 instanceof CadastralParcelSearchResult).toBeTrue(), expect(searchResult0.label).toBe('foo, bar'));
			expect(searchResult0.labelFormatted).toBe('<b>foo</b>, bar');
			expect(searchResult0.center).toEqual([10.270116669125855, 48.44638557638974]);
			expect(searchResult0.extent).toEqual([0, 1, 2, 3]);
			expect(searchResult0.geometry.data).toBe('SRID=3857;POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))');
			expect(searchResult0.geometry.sourceType).toEqual(new SourceType(SourceTypeName.EWKT, null, 3857));
			expect(searchResult0.id).not.toBeNull();
		});

		it('returns an empty array when response is empty', async () => {
			const term = 'term';
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/search/type/cp/searchText/${term}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify([]))));

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
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

			try {
				await loadBvvCadastralParcelSearchResults(term);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('SearchResults for cadastral parcels could not be retrieved');
			}
		});
	});
});
