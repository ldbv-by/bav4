import { $injector } from '../../../src/injection';
import { loadBvvGeoResources, loadExampleGeoResources } from '../../../src/services/domain/geoResource.provider';

describe('GeoResource provider', () => {
	describe('Bvv GeoResource provider', () => {


		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			fetch: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});


		const wmsDefinition = { id: 'wmsId', label: 'wmsLabel', background: false, opacity: 0.5, url: 'wmsUrl', layers: 'wmsLayer', format: 'image/png', type: 'wms' };
		const wmtsDefinition = { id: 'wmtsId', label: 'wmtsLabel', background: true, opacity: 1.0, url: 'wmtsUrl', type: 'wmts' };
		const vectorDefinition = { id: 'wmtsId', label: 'vectorLabel', background: false, opacity: 1.0, url: 'vectorUrl', sourceType: 'kml', type: 'vector' };
		const aggregateDefinition = { id: 'wmtsId', label: 'aggregateLabel', background: true, opacity: 1.0, geoResourceIds: ['wmtsId', 'wmsId'], type: 'aggregate' };


		const vadlidateGeoResourceProperties = (georesource, definition) => {
			expect(georesource.id).toBe(definition.id);
			expect(georesource.label).toBe(definition.label);
			expect(georesource.background).toBe(definition.background);
			expect(georesource.opacity).toBe(definition.opacity);
			expect(Symbol.keyFor(georesource.getType())).toBe(definition.type);
		};



		it('loads GeoResources', async () => {

			const backendUrl = 'https://backend.url';
			const expectedArgs0 = backendUrl + 'georesources';
			const expectedArgs1 = {
				timeout: 2000,
				mode: 'cors'
			};
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify([
						wmsDefinition, wmtsDefinition, vectorDefinition, aggregateDefinition
					])
				)
			));


			const georesources = await loadBvvGeoResources();

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

		it('logs a war statememt when GeoResource type cannot be resolved', async () => {

			const warnSpy = spyOn(console, 'warn');
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
			spyOn(httpService, 'fetch').and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify([
						{ id: 'someId', type: 'somethingUnknown' }
					])
				)
			));


			await loadBvvGeoResources();

			expect(warnSpy).toHaveBeenCalledWith('Could not create a GeoResource  for someId');
		});

		it('rejects when backend request cannot be fulfilled', (done) => {

			const backendUrl = 'https://backend.url';
			const expectedArgs0 = backendUrl + 'georesources';
			const expectedArgs1 = {
				timeout: 2000,
				mode: 'cors'
			};
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));


			loadBvvGeoResources().then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe('GeoResources could not be loaded');
				done();
			});

		});
	});
	describe('Example GeoResource provider', () => {
		it('loads GeoResources', async () => {
			const georesources = await loadExampleGeoResources();
            
			expect(georesources.length).toBe(6);
		});
	});
});


