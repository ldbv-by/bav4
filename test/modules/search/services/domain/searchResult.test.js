import { CadastralParcelSearchResult, GeoResourceSearchResult, LocationSearchResult, SearchResult, SearchResultTypes } from '../../../../../src/modules/search/services/domain/searchResult';

describe('searchResult', () => {

	describe('SearchResultTypes', () => {

		it('provides an enum of all available types', () => {

			expect(Object.keys(SearchResultTypes).length).toBe(3);
			expect(SearchResultTypes.LOCATION).toBeTruthy();
			expect(SearchResultTypes.GEORESOURCE).toBeTruthy();
			expect(SearchResultTypes.CADASTRAL_PARCEL).toBeTruthy();
		});
	});
});

describe('abstract SearchResult', () => {

	class SearchResultNoImpl extends SearchResult {
		constructor(label, labelFormatted) {
			super(label, labelFormatted);
		}
	}

	class SearchResultImpl extends SearchResult {
		constructor(label, labelFormatted) {
			super(label, labelFormatted);
		}
	}

	describe('constructor', () => {

		it('throws exception when instantiated without inheritance', () => {
			expect(() => new SearchResult()).toThrowError(TypeError, 'Can not construct abstract class.');
		});

		it('throws exception when instantiated without id', () => {
			expect(() => new SearchResultNoImpl()).toThrowError(TypeError, 'label must not be undefined');
		});
	});

	describe('methods', () => {

		it('throws exception when abstract #getType is called without overriding', () => {
			expect(() => new SearchResultNoImpl('some').getType()).toThrowError(TypeError, 'Please implement abstract method #getType or do not call super.getType from child.');
		});
	});

	describe('properties', () => {

		it('provides default properties', () => {
			const label = 'label';
			const georesource = new SearchResultImpl(label);

			expect(georesource.labelFormated).toBe(label);
		});

		it('provides getter ', () => {
			const label = 'label';
			const labelFormated = 'labelFormatted';
			const georesource = new SearchResultImpl(label, labelFormated);

			expect(georesource.label).toBe(label);
			expect(georesource.labelFormated).toBe(labelFormated);
		});
	});
});

describe('LocationSearchResult', () => {

	it('instantiates a LocationSearchResult', () => {
		const label = 'label';
		const labelFormated = 'labelFormatted';
		const center = [1, 2], extent = [3, 4, 5, 6];

		const locationSearchResult = new LocationSearchResult(label, labelFormated, center, extent);

		expect(locationSearchResult.getType()).toEqual(SearchResultTypes.LOCATION);
		expect(locationSearchResult.label).toBe(label);
		expect(locationSearchResult.labelFormated).toBe(labelFormated);
		expect(locationSearchResult.center).toEqual(center);
		expect(locationSearchResult.extent).toEqual(extent);
	});

	it('provides default properties', () => {
		const label = 'label';
		const labelFormated = 'labelFormatted';

		const locationSearchResult = new LocationSearchResult(label, labelFormated);

		expect(locationSearchResult.getType()).toEqual(SearchResultTypes.LOCATION);
		expect(locationSearchResult.label).toBe(label);
		expect(locationSearchResult.labelFormated).toBe(labelFormated);
		expect(locationSearchResult.center).toBeNull();
		expect(locationSearchResult.extent).toBeNull();
	});
});

describe('CadastralParcelSearchResult', () => {

	it('instantiates a CadastralParcelSearchResult', () => {
		const label = 'label';
		const labelFormated = 'labelFormatted';
		const center = [1, 2], extent = [3, 4, 5, 6];

		const cadastralParcelSearchResult = new CadastralParcelSearchResult(label, labelFormated, center, extent);

		expect(cadastralParcelSearchResult.getType()).toEqual(SearchResultTypes.CADASTRAL_PARCEL);
		expect(cadastralParcelSearchResult.label).toBe(label);
		expect(cadastralParcelSearchResult.labelFormated).toBe(labelFormated);
		expect(cadastralParcelSearchResult.center).toEqual(center);
		expect(cadastralParcelSearchResult.extent).toEqual(extent);
	});

	it('provides default properties', () => {
		const label = 'label';
		const labelFormated = 'labelFormatted';

		const cadastralParcelSearchResult = new CadastralParcelSearchResult(label, labelFormated);

		expect(cadastralParcelSearchResult.getType()).toEqual(SearchResultTypes.CADASTRAL_PARCEL);
		expect(cadastralParcelSearchResult.label).toBe(label);
		expect(cadastralParcelSearchResult.labelFormated).toBe(labelFormated);
		expect(cadastralParcelSearchResult.center).toBeNull();
		expect(cadastralParcelSearchResult.extent).toBeNull();
	});
});

describe('GeoResourceSearchResult', () => {

	it('instantiates a GeoResourceSearchResult', () => {
		const geoResourceId = 'geoResourceId';
		const label = 'label';
		const labelFormated = 'labelFormatted';

		const geoResourceSearchResult = new GeoResourceSearchResult(geoResourceId, label, labelFormated);

		expect(geoResourceSearchResult.getType()).toEqual(SearchResultTypes.GEORESOURCE);
		expect(geoResourceSearchResult.geoResourceId).toBe(geoResourceId);
		expect(geoResourceSearchResult.label).toBe(label);
		expect(geoResourceSearchResult.labelFormated).toBe(labelFormated);
	});
});
