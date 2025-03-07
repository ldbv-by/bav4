import { HighlightFeatureType } from '../../src/domain/highlightFeature';

describe('HighlightFeature', () => {
	it('exports a enum for HighlightFeatureTypes', () => {
		expect(Object.keys(HighlightFeatureType).length).toBe(6);
		expect(HighlightFeatureType.MARKER).toBe(0);
		expect(HighlightFeatureType.MARKER_TMP).toBe(1);
		expect(HighlightFeatureType.QUERY_RUNNING).toBe(2);
		expect(HighlightFeatureType.QUERY_SUCCESS).toBe(3);
		expect(HighlightFeatureType.DEFAULT).toBe(4);
		expect(HighlightFeatureType.DEFAULT_TMP).toBe(5);
	});
});
