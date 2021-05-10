/* eslint-disable no-undef */
import { GeoResourceService } from '../../src/services/GeoResourceService';
import { VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from '../../src/services/domain/geoResources';
import { loadBvvGeoResources, loadExampleGeoResources } from '../../src/services/provider/geoResource.provider';

describe('GeoResourceService', () => {

	const setup = (provider = loadExampleGeoResources) => {
		return new GeoResourceService(provider);
	};
	const wmtsGeoResource = new WMTSGeoResource('wmtsId', 'wmtsLabel', 'wmtsUrl');

	describe('init', () => {

		it('initializes the service', async () => {
			const instanceUnderTest = setup();
			expect(instanceUnderTest._georesources).toBeNull();

			const georesources = await instanceUnderTest.init();

			//six gepresources from provider, two from fallback
			expect(georesources.length).toBe(8);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new GeoResourceService();
			expect(instanceUnderTest._provider).toEqual(loadBvvGeoResources);
		});


		it('just provides GeoResources when already initialized', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [wmtsGeoResource];

			const georesources = await instanceUnderTest.init();

			expect(georesources.length).toBe(1);
		});

		it('loads a fallback GeoResouce when provider cannot fulfill', async () => {

			const instanceUnderTest = setup(async () => {
				throw new Error('GeoResources could not be loaded');
			});
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest._georesources).toBeNull();

			const georesources = await instanceUnderTest.init();

			expect(georesources.length).toBe(2);
			expect(georesources[0].id).toBe('atkis');
			expect(georesources[1].id).toBe('atkis_sw');
			expect(warnSpy).toHaveBeenCalledWith('GeoResources could not be fetched from backend. Using fallback geoResources ...');
		});
	});

	describe('all', () => {

		it('provides all GeoResources', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [wmtsGeoResource];

			const geoResources = instanceUnderTest.all();

			expect(geoResources.length).toBe(1);
		});

		it('logs a warn statement when service hat not been initialized', () => {
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest.all()).toEqual([]);
			expect(warnSpy).toHaveBeenCalledWith('GeoResourceService not yet initialized');
		});
	});

	describe('byId', () => {

		it('provides a GeoResource by id', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [wmtsGeoResource];


			const geoResource = instanceUnderTest.byId('wmtsId');

			expect(geoResource).toBeTruthy();
		});

		it('provides null if for an unknown id', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [wmtsGeoResource];

			const geoResource = instanceUnderTest.byId('something');

			expect(geoResource).toBeNull();
		});

		it('logs a warn statement when when service hat not been initialized', () => {
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest.byId('unknownId')).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith('GeoResourceService not yet initialized');
		});
	});

	describe('addOrReplace', () => {

		it('adds a GeoResource', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [];
			const geoResource = new WmsGeoResource('wms', 'Wms', 'https://some.url', 'someLayer', 'image/png');

			instanceUnderTest.addOrReplace(geoResource);
			expect(instanceUnderTest._georesources.length).toBe(1);
			expect(instanceUnderTest._georesources[0]).toEqual(geoResource);
		});

		it('replaces a GeoResource', async () => {
			const instanceUnderTest = setup();
			const geoResourceId = 'geoResId';
			const geoResource = new WmsGeoResource(geoResourceId, 'Wms', 'https://some.url', 'someLayer', 'image/png');
			instanceUnderTest._georesources = [geoResource];
			const geoResource2 = new VectorGeoResource(geoResourceId, 'Vector', VectorSourceType.GEOJSON).setUrl('another url');

			instanceUnderTest.addOrReplace(geoResource2);
			expect(instanceUnderTest._georesources.length).toBe(1);
			expect(instanceUnderTest._georesources[0]).toEqual(geoResource2);
		});
	});
});

