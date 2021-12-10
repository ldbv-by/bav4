/* eslint-disable no-undef */
import { $injector } from '../../../../src/injection';
import { SearchResult, SearchResultTypes } from '../../../../src/modules/search/services/domain/searchResult';
import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults, loadBvvCadastralParcelSearchResults } from '../../../../src/modules/search/services/provider/searchResult.provider';
import { SearchResultService } from '../../../../src/modules/search/services/SearchResultService';

describe('SearchResultService', () => {

	const environmentService = {
		isStandalone: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('EnvironmentService', environmentService);
	});

	const setup = (
		locationSearchResultProvider = () => { },
		geoResourceSearchResultProvider = () => { },
		cadastralParcelResultProvider = () => { }
	) => {
		return new SearchResultService(locationSearchResultProvider, geoResourceSearchResultProvider, cadastralParcelResultProvider);
	};

	describe('constructor', () => {

		it('initializes the service with default provider', () => {
			const instanceUnderTest = new SearchResultService();

			expect(instanceUnderTest._locationResultProvider).toBe(loadBvvLocationSearchResults);
			expect(instanceUnderTest._georesourceResultProvider).toBe(loadBvvGeoResourceSearchResults);
			expect(instanceUnderTest._cadastralParcelResultProvider).toBe(loadBvvCadastralParcelSearchResults);
		});
	});

	describe('_newFallbackGeoResouceSearchResults', () => {

		it('provides fallback search results for geoResources', () => {
			const instanceUnderTest = setup();

			const results = instanceUnderTest._newFallbackGeoResouceSearchResults();

			expect(results).toHaveSize(2);
			expect(results[0].id).toBe('atkis');
			expect(results[1].id).toBe('atkis_sw');
		});
	});

	describe('_newFallbackLocationSearchResults', () => {

		it('provides fallback search results for locations', () => {
			const instanceUnderTest = setup();

			const results = instanceUnderTest._newFallbackLocationSearchResults();

			expect(results).toHaveSize(2);
			expect(results[0].extent).toEqual([1265550.466246523, 6117691.209423095, 1304131.841667551, 6147931.061531809]);
			expect(results[1].center).toEqual([1290240.0895689954, 6130449.47786758]);
		});
	});

	describe('_newFallbackCadastralParcelSearchResults', () => {

		it('provides fallback search results for cadastral parcels', () => {
			const instanceUnderTest = setup();

			const results = instanceUnderTest._newFallbackCadastralParcelSearchResults();

			expect(results).toHaveSize(0);
		});
	});

	describe('geoResourceByTerm', () => {

		it('provides search results for geoGeoresources', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			const provider = jasmine.createSpy().and.resolveTo([
				new SearchResult('foo', 'foo', 'foo', SearchResultTypes.GEORESOURCE),
				new SearchResult('bar', 'bar', 'bar', SearchResultTypes.GEORESOURCE)
			]);
			const instanceUnderTest = setup(null, provider);

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(2);
		});

		it('provides fallback search results', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(true);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toEqual(instanceUnderTest._newFallbackGeoResouceSearchResults());
		});
	});

	describe('locationsByTerm', () => {

		it('provides search results for locations', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			const provider = jasmine.createSpy().and.resolveTo([
				new SearchResult('foo', 'foo', 'foo', SearchResultTypes.LOCATION),
				new SearchResult('bar', 'bar', 'bar', SearchResultTypes.LOCATION)
			]);
			const instanceUnderTest = setup(provider);

			const results = await instanceUnderTest.locationsByTerm(term);

			expect(results).toHaveSize(2);
		});

		it('provides fallback search results', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(true);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.locationsByTerm(term);

			expect(results).toEqual(instanceUnderTest._newFallbackLocationSearchResults());
		});
	});

	describe('cadastralParcelsByTerm', () => {

		it('provides search results for cadastral parcels', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			const provider = jasmine.createSpy().and.resolveTo([
				new SearchResult('foo', 'foo', 'foo', SearchResultTypes.CADASTRAL_PARCEL),
				new SearchResult('bar', 'bar', 'bar', SearchResultTypes.CADASTRAL_PARCEL)
			]);
			const instanceUnderTest = setup(null, null, provider);

			const results = await instanceUnderTest.cadastralParcelsByTerm(term);

			expect(results).toHaveSize(2);
		});

		it('provides fallback search results', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(true);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.cadastralParcelsByTerm(term);

			expect(results).toEqual(instanceUnderTest._newFallbackCadastralParcelSearchResults());
		});
	});
});
