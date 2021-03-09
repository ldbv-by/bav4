/* eslint-disable no-undef */
import { GeoResourceService } from '../../src/services/GeoResourceService';
import { WmsGeoResource, WMTSGeoResource } from '../../src/services/domain/geoResources';
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

			expect(georesources.length).toBe(6);
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

		it('loads fallback GeoResouces when backend is not available', async () => {

			const instanceUnderTest = setup(async () => {
				throw new Error('GeoResources could not be loaded');
			});
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest._georesources).toBeNull();

			const georesources = await instanceUnderTest.init();

			expect(georesources.length).toBe(1);
			expect(georesources[0].id).toBe('atkis');
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

	describe('add', () => {

		it('adds a GeoResource', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [];
			const geoResource = new WmsGeoResource('wms', 'Wms', 'https://some.url', 'someLayer', 'image/png');

			let success = instanceUnderTest.add(geoResource);
			expect(success).toBeTrue();

			success = instanceUnderTest.add(geoResource);
			expect(success).toBeFalse();
		});
	});
});
