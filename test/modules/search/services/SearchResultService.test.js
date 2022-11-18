/* eslint-disable no-undef */
import { $injector } from '../../../../src/injection';
import { CadastralParcelSearchResult, GeoResourceSearchResult, LocationSearchResult } from '../../../../src/modules/search/services/domain/searchResult';
import { loadBvvGeoResourceSearchResults, loadBvvLocationSearchResults, loadBvvCadastralParcelSearchResults } from '../../../../src/modules/search/services/provider/searchResult.provider';
import { MAX_QUERY_TERM_LENGTH, SearchResultService } from '../../../../src/modules/search/services/SearchResultService';
import { GeoResourceFuture, WmsGeoResource } from '../../../../src/domain/geoResources';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../../../src/domain/sourceType';

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

	const importWmsService = {
		forUrl: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('SourceTypeService', sourceTypeService)
			.registerSingleton('ImportVectorDataService', importVectorDataService)
			.registerSingleton('ImportWmsService', importWmsService);
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

	describe('_newFallbackGeoResourceSearchResults', () => {

		it('provides fallback search results for geoResources', () => {
			const instanceUnderTest = setup();

			const results = instanceUnderTest._newFallbackGeoResourceSearchResults();

			expect(results).toHaveSize(2);
			results.forEach(r => expect(r instanceof GeoResourceSearchResult).toBeTrue());
			expect(results[0].geoResourceId).toBe('atkis');
			expect(results[0].label).toBe('Base Map 1');
			expect(results[1].geoResourceId).toBe('atkis_sw');
			expect(results[1].label).toBe('Base Map 2');
		});
	});

	describe('_newFallbackLocationSearchResults', () => {

		it('provides fallback search results for locations', () => {
			const instanceUnderTest = setup();

			const results = instanceUnderTest._newFallbackLocationSearchResults();

			expect(results).toHaveSize(2);
			results.forEach(r => expect(r instanceof LocationSearchResult).toBeTrue());
			expect(results[0].center).toEqual([1284841.153957037, 6132811.135477452]);
			expect(results[0].extent).toEqual([1265550.466246523, 6117691.209423095, 1304131.841667551, 6147931.061531809]);
			expect(results[1].center).toEqual([1290240.0895689954, 6130449.47786758]);
			expect(results[1].extent).toBeNull();
		});
	});

	describe('_newFallbackCadastralParcelSearchResults', () => {

		it('provides fallback search results for cadastral parcels', () => {
			const instanceUnderTest = setup();

			const results = instanceUnderTest._newFallbackCadastralParcelSearchResults();

			expect(results).toHaveSize(0);
		});
	});

	describe('_getGeoResourcesForUrl', () => {

		const checkGeoResourceSearchResultForVectorSource = async (sourceTypeName) => {
			const geoResourceId = 'id';
			const geoResource = new GeoResourceFuture(geoResourceId, () => { });
			const sourceType = new SourceType(sourceTypeName);
			const url = 'http://foo.bar';
			const label = 'label';
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
			spyOn(importVectorDataService, 'forUrl').withArgs(url, { sourceType: sourceType })
				.and.returnValue(geoResource);
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, '_mapSourceTypeToLabel').withArgs(sourceType).and.returnValue(label);

			const results = await instanceUnderTest._getGeoResourcesForUrl(url);

			expect(results).toHaveSize(1);
			expect(results[0].geoResourceId).toBe(geoResourceId);
			expect(results[0].label).toBe(label);
			expect(results[0].labelFormatted).toBe(label);
			expect(results[0] instanceof GeoResourceSearchResult).toBeTrue();
		};

		const checkGeoResourceSearchResultForNoGeoResource = async (sourceTypeName) => {
			const sourceType = new SourceType(sourceTypeName);
			const url = 'http://foo.bar';
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
			spyOn(importVectorDataService, 'forUrl').withArgs(url, { sourceType: sourceType })
				.and.returnValue(null);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest._getGeoResourcesForUrl(url);
			expect(results).toHaveSize(0);
		};

		it('returns search results for KML source type', async () => {
			await checkGeoResourceSearchResultForVectorSource(SourceTypeName.KML);
		});

		it('returns search results for GPX source type', async () => {
			await checkGeoResourceSearchResultForVectorSource(SourceTypeName.GPX);
		});

		it('returns search results for GeoJson source type', async () => {
			await checkGeoResourceSearchResultForVectorSource(SourceTypeName.GEOJSON);
		});

		it('returns an empty array as result for a KML source type when georesource cannot be created', async () => {
			await checkGeoResourceSearchResultForNoGeoResource(SourceTypeName.KML);
		});

		it('returns an empty array as result for a KML source type when georesource cannot be created', async () => {
			await checkGeoResourceSearchResultForNoGeoResource(SourceTypeName.GPX);
		});

		it('returns an empty array as result for a KML source type when georesource cannot be created', async () => {
			await checkGeoResourceSearchResultForNoGeoResource(SourceTypeName.GEOJSON);
		});

		it('returns search results for Wms source type', async () => {
			const sourceType = new SourceType(SourceTypeName.WMS);
			const url = 'http://foo.bar';
			const geoResourceId = 'id';
			const label = 'label';
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
			spyOn(importWmsService, 'forUrl').withArgs(url, { sourceType: sourceType, isAuthenticated: false })
				.and.resolveTo([new WmsGeoResource('id', label, 'url', 'layers')]);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest._getGeoResourcesForUrl(url);

			expect(results).toHaveSize(1);
			expect(results[0].geoResourceId).toBe(geoResourceId);
			expect(results[0].label).toBe(label);
			expect(results[0].labelFormatted).toBe(label);
			expect(results[0] instanceof GeoResourceSearchResult).toBeTrue();
		});

		it('returns search results for baa authenticated Wms source type', async () => {
			const sourceType = new SourceType(SourceTypeName.WMS);
			const url = 'http://foo.bar';
			const geoResourceId = 'id';
			const label = 'label';
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.BAA_AUTHENTICATED, sourceType));
			spyOn(importWmsService, 'forUrl').withArgs(url, { sourceType: sourceType, isAuthenticated: true })
				.and.resolveTo([new WmsGeoResource('id', label, 'url', 'layers')]);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest._getGeoResourcesForUrl(url);

			expect(results).toHaveSize(1);
			expect(results[0].geoResourceId).toBe(geoResourceId);
			expect(results[0].label).toBe(label);
			expect(results[0].labelFormatted).toBe(label);
			expect(results[0] instanceof GeoResourceSearchResult).toBeTrue();
		});

		it('returns an empty array as result for a Wms source type when georesource cannot be created', async () => {
			const sourceType = new SourceType(SourceTypeName.WMS);
			const url = 'http://foo.bar';
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
			spyOn(importWmsService, 'forUrl').withArgs(url, { sourceType: sourceType, isAuthenticated: false })
				.and.resolveTo([]);
			const instanceUnderTest = setup();

			const results = await instanceUnderTest._getGeoResourcesForUrl(url);

			expect(results).toHaveSize(0);
		});

		it('returns an empty array as result when source type result is NOT ok', async () => {
			const url = 'http://foo.bar';
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
			const instanceUnderTest = setup();

			const results = await instanceUnderTest._getGeoResourcesForUrl(url);

			expect(results).toHaveSize(0);
		});
	});

	describe('geoResourceByTerm', () => {

		it('provides search results for geoGeoresources from the provider', async () => {
			const term = 'term';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forData').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
			const provider = jasmine.createSpy().and.resolveTo([
				new GeoResourceSearchResult('geoResourceId0', 'foo'),
				new GeoResourceSearchResult('geoResourceId1', 'bar')
			]);
			const instanceUnderTest = setup(null, provider);

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(2);
			results.forEach(r => expect(r instanceof GeoResourceSearchResult).toBeTrue());
		});

		it('provides a search result for a URL', async () => {
			const term = 'http://foo.bar';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, '_getGeoResourcesForUrl').withArgs(term).and.resolveTo([
				new GeoResourceSearchResult('geoResourceId0', 'foo'),
				new GeoResourceSearchResult('geoResourceId1', 'bar')
			]);

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(2);
			results.forEach(r => expect(r instanceof GeoResourceSearchResult).toBeTrue());
		});

		it('provides a search result for vector data', async () => {
			const term = '<gpx>foo</gpx>';
			const geoResourceId = 'id';
			const label = 'label';
			spyOn(environmentService, 'isStandalone').and.returnValue(false);
			spyOn(sourceTypeService, 'forData').and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, SourceTypeName.GPX));
			spyOn(importVectorDataService, 'forData').withArgs(term, { sourceType: SourceTypeName.GPX })
				.and.returnValue(new GeoResourceFuture(geoResourceId, () => { }));
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, '_mapSourceTypeToLabel').withArgs(SourceTypeName.GPX).and.returnValue(label);

			const results = await instanceUnderTest.geoResourcesByTerm(term);

			expect(results).toHaveSize(1);
			expect(results[0].geoResourceId).toBe(geoResourceId);
			expect(results[0].label).toBe(label);
			expect(results[0].labelFormatted).toBe(label);
			expect(results[0] instanceof GeoResourceSearchResult).toBeTrue();
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
				new LocationSearchResult('foo'),
				new LocationSearchResult('bar')
			]);
			const instanceUnderTest = setup(provider);

			const results = await instanceUnderTest.locationsByTerm(term);

			results.forEach(r => expect(r instanceof LocationSearchResult).toBeTrue());
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

		it('provides an empty array as results when term is a URL', async () => {
			const term = 'http://foo.bar';
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
				new CadastralParcelSearchResult('foo'),
				new CadastralParcelSearchResult('bar')
			]);
			const instanceUnderTest = setup(null, null, provider);

			const results = await instanceUnderTest.cadastralParcelsByTerm(term);

			expect(results).toHaveSize(2);
			results.forEach(r => expect(r instanceof CadastralParcelSearchResult).toBeTrue());
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

		it('provides an empty array as results when term is a URL', async () => {
			const term = 'http://foo.bar';
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
