import { VectorSourceType } from '../../../src/services/domain/geoResources';
import { MediaType } from '../../../src/services/HttpService';
import { detectVectorSourceType } from '../../../src/services/provider/vectorSourceType.provider';

describe('vectorSourceType provider', () => {

	describe('default provider', () => {

		it('tries to detect the source type for KML sources', async () => {
			expect(detectVectorSourceType('foo', MediaType.KML)).toBe(VectorSourceType.KML);
			expect(detectVectorSourceType('<kml some>foo</kml>')).toBe(VectorSourceType.KML);
		});

		it('tries to detect the source type for GPX sources', async () => {
			expect(detectVectorSourceType('foo', MediaType.GPX)).toBe(VectorSourceType.GPX);
			expect(detectVectorSourceType('<gpx some>foo</gpx>')).toBe(VectorSourceType.GPX);
		});

		it('tries to detect the source type for GeoJSON sources', async () => {
			expect(detectVectorSourceType('foo', MediaType.GeoJSON)).toBe(VectorSourceType.GEOJSON);
			expect(detectVectorSourceType(JSON.stringify({ type: 'foo' }))).toBe(VectorSourceType.GEOJSON);
		});

		it('returns null when type can not be detected', async () => {
			expect(detectVectorSourceType('foo')).toBeNull();
			expect(detectVectorSourceType(JSON.stringify({ some: 'foo' }))).toBeNull();
		});
	});
});
