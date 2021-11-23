import { HighlightFeatureTypes, HighlightGeometryTypes } from '../../../src/store/highlight/highlight.action';

describe('highlightAction', () => {

	it('exports a enum for HighlightFeatureTypes', () => {
		expect(Object.keys(HighlightFeatureTypes).length).toBe(3);
		expect(HighlightFeatureTypes.DEFAULT).toBe(0);
		expect(HighlightFeatureTypes.TEMPORARY).toBe(1);
		expect(HighlightFeatureTypes.ANIMATED).toBe(2);
	});

	it('exports a enum for HighlightGeometryTypes', () => {
		expect(Object.keys(HighlightGeometryTypes).length).toBe(2);
		expect(HighlightGeometryTypes.GEOJSON).toBe(0);
		expect(HighlightGeometryTypes.WKT).toBe(1);
	});
});
