import { $injector } from '../../src/injection';
import { getTimestamp } from '../../src/utils/layerUtils';
import { XyzGeoResource } from '../../src/domain/geoResources';
import { createDefaultLayer } from '../../src/store/layers/layers.reducer';

describe('layerUtils', () => {
	describe('getTimestamp', () => {
		const geoResourceService = {
			byId: () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('GeoResourceService', geoResourceService);
		});

		describe('referenced GeoResource has no timestamps', () => {
			it('returns `null`', () => {
				const geoResourceId = 'geoResourceId';
				const geoResource = new XyzGeoResource(geoResourceId, 'label', 'url');
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp(layer)).toBeNull();
			});
		});
		describe('referenced GeoResource is unknown', () => {
			it('returns `null`', () => {
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp(layer)).toBeNull();
			});
		});
		describe('the layer contains a timestamp', () => {
			it('returns the timestamp of the layer', () => {
				const timestamp = '1900';
				const geoResourceId = 'geoResourceId';
				const geoResource = new XyzGeoResource(geoResourceId, 'label', 'url').setTimestamps(['2000']);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp({ ...layer, timestamp })).toBe(timestamp);
			});
		});
		describe('the layer does NOT contain a timestamp', () => {
			it('returns the latest timestamp of the GeoResource', () => {
				const timestamp = '1900';
				const geoResourceId = 'geoResourceId';
				const geoResource = new XyzGeoResource(geoResourceId, 'label', 'url').setTimestamps([timestamp, '2000']);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp(layer)).toBe(timestamp);
			});
		});
	});
});
