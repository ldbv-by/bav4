/* eslint-disable no-undef */
import { BvvGeoResourceService } from '../../src/services/BvvGeoResourceService';
import { WmsGeoResource, WMTSGeoResource } from '../../src/services/domain/geoResources';
import { $injector } from '../../src/injection';

describe('BvvGeoResourceService', () => {

	let instanceUnderTest;

	const configService = {
		getValue: () => { }
	};

	const httpService = {
		fetch: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	beforeEach(() => {
		instanceUnderTest = new BvvGeoResourceService();
	});
	const wmsDefinition = { id: 'wmsId', label: 'wmsLabel', background: false, opacity: 0.5, url: 'wmsUrl', layers: 'wmsLayer', format: 'image/png', type: 'wms' };
	const wmtsDefinition = { id: 'wmtsId', label: 'wmtsLabel', background: true, opacity: 1.0, url: 'wmtsUrl', type: 'wmts' };
	const vectorDefinition = { id: 'wmtsId', label: 'vectorLabel', background: false, opacity: 1.0, url: 'vectorUrl', sourceType: 'kml', type: 'vector' };
	const aggregateDefinition = { id: 'wmtsId', label: 'aggregateLabel', background: true, opacity: 1.0, geoResourceIds: ['wmtsId', 'wmsId'], type: 'aggregate' };

	const wmtsGeoResource = new WMTSGeoResource('wmtsId', 'wmtsLabel', 'wmtsUrl');

	const vadlidateGeoResourceProperties = (georesource, definition) => {
		expect(georesource.id).toBe(definition.id);
		expect(georesource.label).toBe(definition.label);
		expect(georesource.background).toBe(definition.background);
		expect(georesource.opacity).toBe(definition.opacity);
		expect(Symbol.keyFor(georesource.getType())).toBe(definition.type);
	};

	describe('init', () => {

		it('initializes the service', async () => {
			
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = backendUrl + 'georesources';
			const expectedArgs1 = {
				timeout: 2000,
				mode: 'cors'
			};
			const configServiceSpy = spyOn(configService, 'getValue').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify([
						wmsDefinition, wmtsDefinition, vectorDefinition, aggregateDefinition
					])
				)
			));

			expect(instanceUnderTest._georesources).toBeNull();

			const georesources = await instanceUnderTest.init();

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(georesources.length).toBe(4);

			const wmsGeoResource = georesources[0];
			vadlidateGeoResourceProperties(wmsGeoResource, wmsDefinition);
			expect(wmsGeoResource.url).toBe(wmsDefinition.url);
			expect(wmsGeoResource.layers).toBe(wmsDefinition.layers);
			expect(wmsGeoResource.format).toBe(wmsDefinition.format);

			const wmtsGeoResource = georesources[1];
			vadlidateGeoResourceProperties(wmtsGeoResource, wmtsDefinition);
			expect(wmtsGeoResource.url).toBe(wmtsGeoResource.url);

			const vectorGeoResource = georesources[2];
			vadlidateGeoResourceProperties(vectorGeoResource, vectorDefinition);
			expect(vectorGeoResource.url).toBe(vectorDefinition.url);
			expect(Symbol.keyFor(vectorGeoResource.sourceType)).toBe(vectorDefinition.sourceType);

			const aggregateGeoResource = georesources[3];
			vadlidateGeoResourceProperties(aggregateGeoResource, aggregateDefinition);
			expect(aggregateGeoResource.geoResourceIds).toEqual(aggregateDefinition.geoResourceIds);

		});


		it('just provides GeoResources when already initialized', async () => {

			instanceUnderTest._georesources = [wmtsGeoResource];

			const georesources = await instanceUnderTest.init();

			expect(georesources.length).toBe(1);
		});

		it('logs a war statememt when GeoResource type cannot be resolved', async() => {

			const warnSpy = spyOn(console, 'warn');
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValue').and.returnValue(backendUrl);
			spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify([
						{ id: 'someId', type: 'somethingUnknown' }
					])
				)
			));


			await instanceUnderTest.init();

			expect(warnSpy).toHaveBeenCalledWith('Could not create a GeoResource  for someId');
		});

		it('rejects when backend is not available', (done) => {

			const backendUrl = 'https://backend.url';
			const expectedArgs0 = backendUrl + 'georesources';
			const expectedArgs1 = {
				timeout: 2000,
				mode: 'cors'
			};
			const configServiceSpy = spyOn(configService, 'getValue').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			expect(instanceUnderTest._georesources).toBeNull();

			instanceUnderTest.init().then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(instanceUnderTest._georesources).toBeNull();
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason).toBe('GeoResourceService could not be initialized: GeoResources could not be loaded');
				done();
			});

		});
	});

	describe('all', () => {

		it('provides all GeoResources', () => {

			instanceUnderTest._georesources = [wmtsGeoResource];

			const geoResources = instanceUnderTest.all();

			expect(geoResources.length).toBe(1);
		});

		it('throws an error when service hat not been initialized', () => {

			expect(() => {
				instanceUnderTest.all();
			})
				.toThrowError(/GeoResourceService not yet initialized/);
		});
	});

	describe('byId', () => {

		it('provides a GeoResource by id', () => {

			instanceUnderTest._georesources = [wmtsGeoResource];


			const geoResource = instanceUnderTest.byId('wmtsId');

			expect(geoResource).toBeTruthy();
		});

		it('provides null if for an unknown id', () => {

			instanceUnderTest._georesources = [wmtsGeoResource];

			const geoResource = instanceUnderTest.byId('something');

			expect(geoResource).toBeNull();
		});

		it('throws an error when service hat not been initialized', () => {

			expect(() => {
				instanceUnderTest.byId('unknownId');
			})
				.toThrowError(/GeoResourceService not yet initialized/);
		});
	});

	describe('add', () => {

		it('adds a GeoResource', async () => {

			instanceUnderTest._georesources = [];
			const geoResource = new WmsGeoResource('wms', 'Wms', 'https://some.url', 'someLayer', 'image/png');

			let success = instanceUnderTest.add(geoResource);
			expect(success).toBeTrue();

			success = instanceUnderTest.add(geoResource);
			expect(success).toBeFalse();
		});
	});
});
