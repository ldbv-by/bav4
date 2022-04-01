import { HighlightFeatureType, HighlightGeometryTypes } from '../../../src/store/highlight/highlight.action';

describe('highlightAction', () => {

	it('exports a enum for HighlightFeatureTypes', () => {
		expect(Object.keys(HighlightFeatureType).length).toBe(4);
		expect(HighlightFeatureType.DEFAULT).toBe(0);
		expect(HighlightFeatureType.TEMPORARY).toBe(1);
		expect(HighlightFeatureType.FEATURE_INFO_RUNNING).toBe(2);
		expect(HighlightFeatureType.FEATURE_INFO_SUCCESS).toBe(3);
	});

	it('exports a enum for HighlightGeometryTypes', () => {
		expect(Object.keys(HighlightGeometryTypes).length).toBe(2);
		expect(HighlightGeometryTypes.GEOJSON).toBe(0);
		expect(HighlightGeometryTypes.WKT).toBe(1);
	});
});
