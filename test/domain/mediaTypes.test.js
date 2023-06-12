import { MediaType } from '../../src/domain/mediaTypes';

describe('MediaType', () => {
	it('is an enum representing common media types', () => {
		expect(Object.entries(MediaType).length).toBe(6);
		expect(Object.isFrozen(MediaType)).toBeTrue();
		expect(MediaType.JSON).toEqual('application/json');
		expect(MediaType.TEXT_HTML).toEqual('text/html');
		expect(MediaType.TEXT_PLAIN).toEqual('text/plain');
		expect(MediaType.KML).toEqual('application/vnd.google-earth.kml+xml');
		expect(MediaType.GPX).toEqual('application/gpx+xml');
		expect(MediaType.GeoJSON).toEqual('application/geo+json');
	});
});
