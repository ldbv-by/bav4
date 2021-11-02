import { HighlightFeatureTypes, HighlightGeometryTypes } from '../../../src/store/highlight/highlight.action';

describe('highlightAction', () => {

	it('exports a enum for HighlightFeatureTypes', () => {
		expect(Object.keys(HighlightFeatureTypes).length).toBe(1);
		expect(HighlightFeatureTypes.DEFAULT).toBe(0);
	});

	it('exports a enum for HighlightGeometryTypes', () => {
		expect(Object.keys(HighlightGeometryTypes).length).toBe(2);
		expect(HighlightGeometryTypes.WKT).toBe(0);
		expect(HighlightGeometryTypes.GEOJSON).toBe(1);
	});
});
