import { HightlightFeatureTypes, HightlightGeometryTypes } from '../../../src/store/highlight/highlight.action';

describe('highlightAction', () => {

	it('exports a enum for HightlightFeatureTypes', () => {
		expect(Object.keys(HightlightFeatureTypes).length).toBe(1);
		expect(HightlightFeatureTypes.DEFAULT).toBe(0);
	});

	it('exports a enum for HightlightGeometryTypes', () => {
		expect(Object.keys(HightlightGeometryTypes).length).toBe(1);
		expect(HightlightGeometryTypes.WKT).toBe(0);
	});
});
