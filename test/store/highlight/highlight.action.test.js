import { HighlightFeatureTypes, HighlightGeometryTypes } from '../../../src/store/highlight/highlight.action';

describe('highlightAction', () => {

	it('exports a enum for HightlightFeatureTypes', () => {
		expect(Object.keys(HighlightFeatureTypes).length).toBe(1);
		expect(HighlightFeatureTypes.DEFAULT).toBe(0);
	});

	it('exports a enum for HightlightGeometryTypes', () => {
		expect(Object.keys(HighlightGeometryTypes).length).toBe(1);
		expect(HighlightGeometryTypes.WKT).toBe(0);
	});
});
