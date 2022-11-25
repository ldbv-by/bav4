/* eslint-disable no-undef */
import { FALLBACK_GEORESOURCE_ID_0, FALLBACK_GEORESOURCE_ID_1, FALLBACK_GEORESOURCE_ID_2, FALLBACK_GEORESOURCE_ID_3, FALLBACK_GEORESOURCE_LABEL_0, FALLBACK_GEORESOURCE_LABEL_1, FALLBACK_GEORESOURCE_LABEL_2, FALLBACK_GEORESOURCE_LABEL_3, GeoResourceService } from '../../src/services/GeoResourceService';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType, WmsGeoResource, XyzGeoResource } from '../../src/domain/geoResources';
import { loadBvvGeoResourceById, loadBvvGeoResources, loadExampleGeoResources } from '../../src/services/provider/geoResource.provider';
import { $injector } from '../../src/injection';
import { loadBvvFileStorageResourceById } from '../../src/services/provider/fileStorage.provider';

describe('GeoResourceService', () => {

	const environmentService = {
		isStandalone: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('EnvironmentService', environmentService);
	});

	const setup = (provider = loadExampleGeoResources, byIdProviders) => {
		return new GeoResourceService(provider, byIdProviders);
	};
	const xyzGeoResource = new XyzGeoResource('xyzId', 'xyzLabel', 'xyzUrl');

	it('exports constant values', async () => {

		expect(FALLBACK_GEORESOURCE_ID_0).toBe('tpo');
		expect(FALLBACK_GEORESOURCE_ID_1).toBe('tpo_mono');
		expect(FALLBACK_GEORESOURCE_ID_2).toBe('bmde_vector');
		expect(FALLBACK_GEORESOURCE_ID_3).toBe('bmde_vector_relief');
		expect(FALLBACK_GEORESOURCE_LABEL_0).toBe('TopPlusOpen');
		expect(FALLBACK_GEORESOURCE_LABEL_1).toBe('TopPlusOpen monochrome');
		expect(FALLBACK_GEORESOURCE_LABEL_2).toBe('Web Vektor');
		expect(FALLBACK_GEORESOURCE_LABEL_3).toBe('Web Vektor Relief');
	});

	describe('init', () => {

		it('initializes the service', async () => {

			const instanceUnderTest = setup();
			expect(instanceUnderTest._georesources).toBeNull();

			const georesources = await instanceUnderTest.init();

			//georesources from provider
			expect(georesources.length).toBe(6);
		});

		it('initializes the service with default providers', async () => {

			const instanceUnderTest = new GeoResourceService();
			expect(instanceUnderTest._provider).toEqual(loadBvvGeoResources);
			expect(instanceUnderTest._byIdProvider).toEqual([loadBvvFileStorageResourceById, loadBvvGeoResourceById]);
		});

		it('initializes the service with custom provider', async () => {

			const customProvider = async () => { };
			const customByIdProvider0 = async () => { };
			const customByIdProvider1 = async () => { };
			const instanceUnderTest = setup(customProvider, [customByIdProvider0, customByIdProvider1]);
			expect(instanceUnderTest._provider).toEqual(customProvider);
			expect(instanceUnderTest._byIdProvider).toEqual([customByIdProvider0, customByIdProvider1]);
		});

		it('just provides GeoResources when already initialized', async () => {

			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [xyzGeoResource];

			const georesources = await instanceUnderTest.init();

			expect(georesources.length).toBe(1);
		});

		describe('provider cannot fulfill', () => {

			it('loads two fallback geoResources when we are in standalone mode', async () => {

				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const instanceUnderTest = setup(async () => {
					throw new Error('GeoResources could not be loaded');
				});
				const warnSpy = spyOn(console, 'warn');

				expect(instanceUnderTest._georesources).toBeNull();

				const georesources = await instanceUnderTest.init();

				expect(georesources.length).toBe(4);
				expect(georesources[0].id).toBe(FALLBACK_GEORESOURCE_ID_0);
				expect(georesources[0].label).toBe(FALLBACK_GEORESOURCE_LABEL_0);
				expect(georesources[0].getAttribution()[0].copyright[0].label).toBe('Bundesamt für Kartographie und Geodäsie (2021)');
				expect(georesources[0].getAttribution()[0].copyright[0].url).toBe('http://www.bkg.bund.de/');
				expect(georesources[0].getAttribution()[0].copyright[1].label).toBe('Datenquellen');
				expect(georesources[0].getAttribution()[0].copyright[1].url).toBe('https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf');
				expect(georesources[1].id).toBe(FALLBACK_GEORESOURCE_ID_1);
				expect(georesources[1].label).toBe(FALLBACK_GEORESOURCE_LABEL_1);
				expect(georesources[1].getAttribution()[0].copyright[0].label).toBe('Bundesamt für Kartographie und Geodäsie (2021)');
				expect(georesources[1].getAttribution()[0].copyright[0].url).toBe('http://www.bkg.bund.de/');
				expect(georesources[1].getAttribution()[0].copyright[1].label).toBe('Datenquellen');
				expect(georesources[1].getAttribution()[0].copyright[1].url).toBe('https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf');
				expect(warnSpy).toHaveBeenCalledWith('GeoResources could not be fetched from backend. Using fallback geoResources ...');
			});

			it('logs an error when we are NOT in standalone mode', async () => {

				spyOn(environmentService, 'isStandalone').and.returnValue(false);
				const instanceUnderTest = setup(async () => {
					throw new Error('GeoResources could not be loaded');
				});
				const errorSpy = spyOn(console, 'error');


				const topics = await instanceUnderTest.init();

				expect(topics).toEqual([]);
				expect(errorSpy).toHaveBeenCalledWith('GeoResources could not be fetched from backend.', jasmine.anything());
			});
		});
	});

	describe('all', () => {

		it('provides all GeoResources', () => {

			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [xyzGeoResource];

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

		it('provides a GeoResource by its id', () => {

			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [xyzGeoResource];


			const geoResource = instanceUnderTest.byId('xyzId');

			expect(geoResource).toBeTruthy();
		});

		it('provides null if for an unknown id', () => {

			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [xyzGeoResource];

			const geoResource = instanceUnderTest.byId('something');

			expect(geoResource).toBeNull();
		});

		it('provides null if for null or undefined id', () => {

			const instanceUnderTest = setup();
			instanceUnderTest._georesources = [xyzGeoResource];

			expect(instanceUnderTest.byId(null)).toBeNull();
			expect(instanceUnderTest.byId(undefined)).toBeNull();
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

	describe('asyncById', () => {

		it('adds a GeoResourceFuture to the internal cache and returns it', async () => {
			const id = 'id';
			const expectedFuture = new GeoResourceFuture(id, () => { });
			const customByIdProvider0 = () => null;
			const customByIdProvider1 = () => expectedFuture;
			const instanceUnderTest = setup(async () => [], [customByIdProvider0, customByIdProvider1]);
			await instanceUnderTest.init();

			const future = instanceUnderTest.asyncById(id);

			expect(future).toEqual(expectedFuture);
			expect(instanceUnderTest._georesources[0]).toEqual(expectedFuture);
		});

		it('returns null when no byIdProvider can fulfill', async () => {
			const customByIdProvider0 = async () => null;
			const customByIdProvider1 = async () => null;
			const instanceUnderTest = setup(async () => [], [customByIdProvider0, customByIdProvider1]);
			await instanceUnderTest.init();

			const future = instanceUnderTest.asyncById('foo');

			expect(future).toBeNull();
			expect(instanceUnderTest._georesources).toHaveSize(0);
		});
	});
});

