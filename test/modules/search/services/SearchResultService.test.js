/* eslint-disable no-undef */
import { $injector } from '../../../../src/injection';
import { SearchResult, SearchResultTypes } from '../../../../src/modules/search/services/domain/searchResult';
import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults, loadBvvCadastralParcelSearchResults } from '../../../../src/modules/search/services/provider/searchResult.provider';
import { MAX_QUERY_TERM_LENGTH, SearchResultService } from '../../../../src/modules/search/services/SearchResultService';
import { GeoResourceFuture } from '../../../../src/services/domain/geoResources';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../../../src/services/domain/sourceType';

describe('MAX_QUERY_TERM_LENGTH', () => {

	it('exports a constant defining the max query length for provider', () => {
		expect(MAX_QUERY_TERM_LENGTH).toBe(140);
	});
});

describe('SearchResultService', () => {

	const environmentService = {
		isStandalone: () => { }
	};

	const sourceTypeService = {
		forData: () => { },
		forUrl: () => { }
	};

	const importVectorDataService = {
		forData: () => { },
		forUrl: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('SourceTypeService', sourceTypeService)
			.registerSingleton('ImportVectorDataService', importVectorDataService);
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

			const results = instanceUnderTest._newFallbackGeoResourceSearchResults();

			expect(results).toHaveSize(2);
			expect(results[0].id).toBe('atkis');
			expect(results[0].layerId).toContain('atkis_');
			expect(results[0].label).toBe('Base Layer 1');
			expect(results[0].labelFormated).toBe('Base Layer 1');
			expect(results[1].id).toBe('atkis_sw');
			expect(results[1].layerId).toContain('atkis_sw_');
			expect(results[1].label).toBe('Base Layer 2');
			expect(results[1].labelFormated).toBe('Base Layer 2');
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

		it('provides search results for geoGeoresources from the provider', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forData').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
			const provider = jasmine.createSpy().and.resolveTo([
				new SearchResult('foo', 'foo', 'foo', SearchResultTypes.GEORESOURCE),
				new SearchResult('bar', 'bar', 'bar', SearchResultTypes.GEORESOURCE)
			]);
			const instanceUnderTest = setup(null, provider);

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(2);
		});

		it('provides a search result for a URL providing a vector source', async () => {
			const term = 'http://foo.bar';
			const id = 'id';
			const label = 'label';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forUrl').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, SourceTypeName.GPX));
			spyOn(importVectorDataService, 'forUrl').withArgs(term, { sourceType: SourceTypeName.GPX })
				.and.returnValue(new GeoResourceFuture('id', () => { }, 'label'));
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, '_mapSourceTypeToLabel').withArgs(SourceTypeName.GPX).and.returnValue(label);

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(1);
			expect(results[0].id).toBe(id);
			expect(results[0].layerId).toBe(id);
			expect(results[0].label).toBe(label);
			expect(results[0].labelFormated).toBe(label);
			expect(results[0].type).toBe(SearchResultTypes.GEORESOURCE);
			expect(results[0].center).toBeNull();
			expect(results[0].extent).toBeNull();
		});

		it('provides an empty array as result for a URL providing a vector source when georesource cannot be created', async () => {
			const term = 'http://foo.bar';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forUrl').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, SourceTypeName.GPX));
			spyOn(importVectorDataService, 'forUrl').withArgs(term, { sourceType: SourceTypeName.GPX })
				.and.returnValue(null);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(0);
		});

		it('provides an empty array as result for a URL when source type cannot be detected', async () => {
			const term = 'http://foo.bar';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forUrl').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(0);
		});

		it('provides a search result for vector data', async () => {
			const term = '<gpx>foo</gpx>';
			const id = 'id';
			const label = 'label';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forData').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, SourceTypeName.GPX));
			spyOn(importVectorDataService, 'forData').withArgs(term, { sourceType: SourceTypeName.GPX })
				.and.returnValue(new GeoResourceFuture('id', () => { }, 'label'));
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, '_mapSourceTypeToLabel').withArgs(SourceTypeName.GPX).and.returnValue(label);

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(1);
			expect(results[0].id).toBe(id);
			expect(results[0].layerId).toBe(id);
			expect(results[0].label).toBe(label);
			expect(results[0].labelFormated).toBe(label);
			expect(results[0].type).toBe(SearchResultTypes.GEORESOURCE);
			expect(results[0].center).toBeNull();
			expect(results[0].extent).toBeNull();
		});

		it('provides an empty array as result for vector data when georesource cannot be created', async () => {
			const term = '<gpx>foo</gpx>';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forData').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, SourceTypeName.GPX));
			spyOn(importVectorDataService, 'forData').withArgs(term, { sourceType: SourceTypeName.GPX })
				.and.returnValue(null);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(0);
		});

		it('provides an empty array as result for vector data when source type cannot be detected', async () => {
			const term = '<gpx>foo</gpx>'.repeat(MAX_QUERY_TERM_LENGTH);
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forData').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(0);
		});

		it('provides fallback search results', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(true);
			const instanceUnderTest = setup();
			const newFallbackGeoResourceSearchResultsSpy = spyOn(instanceUnderTest, '_newFallbackGeoResourceSearchResults').and.callThrough();

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(2);
			expect(newFallbackGeoResourceSearchResultsSpy).toHaveBeenCalled();
		});

		it('provides an empty array as results when max query length is exceeded', async () => {
			const term = 't'.repeat(MAX_QUERY_TERM_LENGTH);
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forData').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(0);
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

		it('provides an empty array as results when max query length is exceeded', async () => {
			const term = 't'.repeat(MAX_QUERY_TERM_LENGTH);
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.locationsByTerm(term);

			expect(results).toHaveSize(0);
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

		it('provides an empty array as results when max query length is exceeded', async () => {
			const term = 't'.repeat(MAX_QUERY_TERM_LENGTH);
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest.cadastralParcelsByTerm(term);

			expect(results).toHaveSize(0);
		});
	});

	describe('_mapSourceTypeToLabel', () => {

		it('maps a SourceType to a label', () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest._mapSourceTypeToLabel(new SourceType(SourceTypeName.KML))).toBe('KML Import');
			expect(instanceUnderTest._mapSourceTypeToLabel(new SourceType(SourceTypeName.GPX))).toBe('GPX Import');
			expect(instanceUnderTest._mapSourceTypeToLabel(new SourceType(SourceTypeName.GEOJSON))).toBe('GeoJSON Import');
			expect(instanceUnderTest._mapSourceTypeToLabel()).toBeNull();
			expect(instanceUnderTest._mapSourceTypeToLabel('foo')).toBeNull();
		});
	});
});
