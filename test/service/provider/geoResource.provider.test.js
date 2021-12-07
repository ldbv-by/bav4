import { $injector } from '../../../src/injection';
import { getBvvAttribution } from '../../../src/services/provider/attribution.provider';
import { loadBvvGeoResources, loadExampleGeoResources, parseBvvAttributionDefinition } from '../../../src/services/provider/geoResource.provider';

describe('GeoResource provider', () => {


	describe('parseBvvAttributionDefinition', () => {

		it('it returns null when basic attribution definition is missing', () => {

			const result = parseBvvAttributionDefinition({});

			expect(result).toBeNull();
		});

		it('it parses a basic attribution definition', () => {

			const attribution = {
				copyright: {
					label: 'label',
					url: 'url'
				},
				description: 'description'
			};
			const attributionDefinition = {
				attribution: {
					copyright: attribution.copyright.label,
					href: attribution.copyright.url,
					description: attribution.description
				}
			};
			const result = parseBvvAttributionDefinition(attributionDefinition);

			expect(result).toEqual([attribution]);
		});

		it('it parses extended attribution definitions', () => {


			const attributionDefinition = {
				attribution: {
					copyright: 'label',
					href: 'url',
					description: 'description'
				},
				extendedAttributions: [
					{

					},
					{
						copyright: 'label1',
						href: 'url1',
						description: 'description1'
					},
					{
						description: 'description2'
					}

				]
			};
			const result = parseBvvAttributionDefinition(attributionDefinition);

			//completely from basic attribution definition
			expect(result[0]).toEqual({
				copyright: {
					label: 'label',
					url: 'url'
				},
				description: 'description'
			});
			//completely from extended attribution definition
			expect(result[1]).toEqual({
				copyright: {
					label: 'label1',
					url: 'url1'
				},
				description: 'description1'
			});
			//partially from extended attribution definition
			expect(result[2]).toEqual({
				copyright: {
					label: 'label',
					url: 'url'
				},
				description: 'description2'
			});
		});
	});


	describe('Bvv GeoResource provider', () => {


		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			get: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});

		const basicAttribution = {
			copyright: 'copyright'
		};

		const wmsDefinition = { id: 'wmsId', label: 'wmsLabel', background: false, opacity: 0.5, url: 'wmsUrl', layers: 'wmsLayer', format: 'image/png', type: 'wms', attribution: basicAttribution };
		const wmtsDefinition = { id: 'wmtsId', label: 'wmtsLabel', background: true, opacity: 1.0, url: 'wmtsUrl', type: 'wmts', attribution: basicAttribution };
		const vectorDefinition = { id: 'wmtsId', label: 'vectorLabel', background: false, opacity: 1.0, url: 'vectorUrl', sourceType: 'kml', type: 'vector', attribution: basicAttribution };
		const aggregateDefinition = { id: 'wmtsId', label: 'aggregateLabel', background: true, opacity: 1.0, geoResourceIds: ['wmtsId', 'wmsId'], type: 'aggregate', attribution: basicAttribution };


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
				timeout: 2000
			};
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
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
			expect(wmsGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(wmsGeoResource._attribution).not.toBeNull();

			const wmtsGeoResource = georesources[1];
			vadlidateGeoResourceProperties(wmtsGeoResource, wmtsDefinition);
			expect(wmtsGeoResource.url).toBe(wmtsGeoResource.url);
			expect(wmtsGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(wmtsGeoResource._attribution).not.toBeNull();

			const vectorGeoResource = georesources[2];
			vadlidateGeoResourceProperties(vectorGeoResource, vectorDefinition);
			expect(vectorGeoResource.url).toBe(vectorDefinition.url);
			expect(Symbol.keyFor(vectorGeoResource.sourceType)).toBe(vectorDefinition.sourceType);
			expect(vectorGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(vectorGeoResource._attribution).not.toBeNull();

			const aggregateGeoResource = georesources[3];
			vadlidateGeoResourceProperties(aggregateGeoResource, aggregateDefinition);
			expect(aggregateGeoResource.geoResourceIds).toEqual(aggregateDefinition.geoResourceIds);
			expect(aggregateGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(aggregateGeoResource._attribution).not.toBeNull();

		});

		it('logs a war statememt when GeoResource type cannot be resolved', async () => {

			const warnSpy = spyOn(console, 'warn');
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
			spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify([
						{ id: 'someId', type: 'somethingUnknown' }
					])
				)
			));


			await loadBvvGeoResources();

			expect(warnSpy).toHaveBeenCalledWith('Could not create a GeoResource  for someId');
		});

		it('rejects when backend request cannot be fulfilled', async () => {

			const backendUrl = 'https://backend.url';
			const expectedArgs0 = backendUrl + 'georesources';
			const expectedArgs1 = {
				timeout: 2000
			};
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0, expectedArgs1).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			try {
				await loadBvvGeoResources();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('GeoResources could not be loaded');
			}
		});
	});

	describe('Example GeoResource provider', () => {
		it('loads GeoResources', async () => {
			const georesources = await loadExampleGeoResources();

			expect(georesources.length).toBe(6);
		});
	});
});


