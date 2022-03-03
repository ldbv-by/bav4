import { $injector } from '../../../src/injection';
import { getBvvAttribution } from '../../../src/services/provider/attribution.provider';
import { loadBvvGeoResourceById, loadBvvGeoResources, loadExampleGeoResources, _definitionToGeoResource, _parseBvvAttributionDefinition } from '../../../src/services/provider/geoResource.provider';

describe('BVV GeoResource provider', () => {
	const configService = {
		getValueAsPath() { }
	};

	const httpService = {
		async get() { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('TranslationService', { translate: (key) => key });
	});

	const basicAttribution = {
		copyright: 'copyright'
	};

	const wmsDefinition = { id: 'wmsId', label: 'wmsLabel', url: 'wmsUrl', layers: 'wmsLayer', format: 'image/png', type: 'wms', attribution: basicAttribution };
	const wmsDefinitionOptionalProperties = { background: true, opacity: 0.5, hidden: true, minZoom: 5, maxZoom: 19, ...wmsDefinition };
	const wmtsDefinition = { id: 'wmtsId', label: 'wmtsLabel', url: 'wmtsUrl', type: 'wmts', attribution: basicAttribution };
	const wmtsDefinitionOptionalProperties = { background: true, opacity: 0.5, hidden: true, minZoom: 5, maxZoom: 19, ...wmtsDefinition };
	const vectorDefinition = { id: 'wmtsId', label: 'vectorLabel', url: 'vectorUrl', sourceType: 'kml', type: 'vector', attribution: basicAttribution };
	const vectorDefinitionOptionaProperties = { background: true, opacity: 0.5, hidden: true, minZoom: 5, maxZoom: 19, ...vectorDefinition };
	const aggregateDefinition = { id: 'wmtsId', label: 'aggregateLabel', geoResourceIds: ['wmtsId', 'wmsId'], type: 'aggregate', attribution: basicAttribution };
	const aggregateDefinitionOptionalProperties = { background: true, opacity: 0.5, hidden: true, minZoom: 5, maxZoom: 19, ...aggregateDefinition };

	const vadlidateGeoResourceProperties = (georesource, definition) => {
		expect(georesource.id).toBe(definition.id);
		expect(georesource.label).toBe(definition.label);
		expect(georesource.background).toBeFalse();
		expect(georesource.opacity).toBe(1.0);
		expect(georesource.hidden).toBeFalse();
		expect(Symbol.keyFor(georesource.getType())).toBe(definition.type);
	};

	describe('_definitionToGeoResource', () => {

		it('maps a unknown BVV definition to a corresponding GeoResource instance', () => {

			expect(_definitionToGeoResource({ type: 'unknown' })).toBeNull();
		});

		it('maps a WMS BVV definition to a corresponding GeoResource instance', () => {
			const wmsGeoResource = _definitionToGeoResource(wmsDefinition);

			vadlidateGeoResourceProperties(wmsGeoResource, wmsDefinition);
			expect(wmsGeoResource.url).toBe(wmsDefinition.url);
			expect(wmsGeoResource.layers).toBe(wmsDefinition.layers);
			expect(wmsGeoResource.format).toBe(wmsDefinition.format);
			expect(wmsGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(wmsGeoResource._attribution).not.toBeNull();
		});

		it('maps a WMS BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const wmsGeoResource = _definitionToGeoResource(wmsDefinitionOptionalProperties);

			expect(wmsGeoResource.background).toBeTrue();
			expect(wmsGeoResource.opacity).toBe(0.5);
			expect(wmsGeoResource.hidden).toBeTrue();
			expect(wmsGeoResource.minZoom).toBe(5);
			expect(wmsGeoResource.maxZoom).toBe(19);
		});

		it('maps a WMTS BVV definition to a corresponding GeoResource instance', () => {
			const wmtsGeoResource = _definitionToGeoResource(wmtsDefinition);

			vadlidateGeoResourceProperties(wmtsGeoResource, wmtsDefinition);
			expect(wmtsGeoResource.url).toBe(wmtsGeoResource.url);
			expect(wmtsGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(wmtsGeoResource._attribution).not.toBeNull();
		});

		it('maps a WMTS BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const wmtsGeoResource = _definitionToGeoResource(wmtsDefinitionOptionalProperties);

			expect(wmtsGeoResource.background).toBeTrue();
			expect(wmtsGeoResource.opacity).toBe(0.5);
			expect(wmtsGeoResource.hidden).toBeTrue();
			expect(wmtsGeoResource.minZoom).toBe(5);
			expect(wmtsGeoResource.maxZoom).toBe(19);
		});

		it('maps a VectorFile BVV definition to a corresponding GeoResource instance', () => {
			const vectorGeoResource = _definitionToGeoResource(vectorDefinition);

			vadlidateGeoResourceProperties(vectorGeoResource, vectorDefinition);
			expect(vectorGeoResource.url).toBe(vectorDefinition.url);
			expect(Symbol.keyFor(vectorGeoResource.sourceType)).toBe(vectorDefinition.sourceType);
			expect(vectorGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(vectorGeoResource._attribution).not.toBeNull();
		});

		it('maps a VectorFile BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const vectorGeoResource = _definitionToGeoResource(vectorDefinitionOptionaProperties);

			expect(vectorGeoResource.background).toBeTrue();
			expect(vectorGeoResource.opacity).toBe(0.5);
			expect(vectorGeoResource.hidden).toBeTrue();
			expect(vectorGeoResource.minZoom).toBe(5);
			expect(vectorGeoResource.maxZoom).toBe(19);
		});

		it('maps a aggregate BVV definition to a corresponding GeoResource instance', () => {
			const aggregateGeoResource = _definitionToGeoResource(aggregateDefinition);

			vadlidateGeoResourceProperties(aggregateGeoResource, aggregateDefinition);
			expect(aggregateGeoResource.geoResourceIds).toEqual(aggregateDefinition.geoResourceIds);
			expect(aggregateGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(aggregateGeoResource._attribution).not.toBeNull();
		});

		it('maps a aggregate BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const aggregateGeoResource = _definitionToGeoResource(aggregateDefinitionOptionalProperties);

			expect(aggregateGeoResource.background).toBeTrue();
			expect(aggregateGeoResource.opacity).toBe(0.5);
			expect(aggregateGeoResource.hidden).toBeTrue();
			expect(aggregateGeoResource.minZoom).toBe(5);
			expect(aggregateGeoResource.maxZoom).toBe(19);
		});
	});


	describe('_parseBvvAttributionDefinition', () => {

		it('it returns null when basic attribution definition is missing', () => {

			const result = _parseBvvAttributionDefinition({});

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
			const result = _parseBvvAttributionDefinition(attributionDefinition);

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
			const result = _parseBvvAttributionDefinition(attributionDefinition);

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


	describe('loadBvvGeoResources', () => {

		it('loads GeoResources', async () => {

			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/georesources/all`;
			const expectedArgs1 = {
				timeout: 2000
			};
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl + '/');
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

			const wmtsGeoResource = georesources[1];
			vadlidateGeoResourceProperties(wmtsGeoResource, wmtsDefinition);

			const vectorGeoResource = georesources[2];
			vadlidateGeoResourceProperties(vectorGeoResource, vectorDefinition);

			const aggregateGeoResource = georesources[3];
			vadlidateGeoResourceProperties(aggregateGeoResource, aggregateDefinition);
		});

		it('logs a warn statement when GeoResource type cannot be resolved', async () => {

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
			const expectedArgs0 = backendUrl + 'georesources/all';
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

	describe('loadExampleGeoResources', () => {

		it('loads GeoResources', async () => {
			const georesources = await loadExampleGeoResources();

			expect(georesources.length).toBe(6);
		});
	});

	describe('loadBvvGeoResourceById', () => {

		it('loads a GeoResource by id', async () => {
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/georesources/byId/${wmsDefinition.id}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl + '/');
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(wmsDefinition)
				)
			));

			const future = loadBvvGeoResourceById(wmsDefinition.id);
			const geoResource = await future.get();

			expect(future.id).toBe(wmsDefinition.id);
			expect(future.label).toBe('layersPlugin_store_layer_default_layer_name_future');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(geoResource.id).toBe(wmsDefinition.id);
		});

		it('rejects when type is unknwon', async () => {
			const id = 'foo';
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
			spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify({ id: id, type: 'somethingUnknown' })
				)
			));

			try {
				const future = loadBvvGeoResourceById(id);
				await future.get();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error.message).toBe(`GeoResource for id '${id}' could not be loaded`);
			}
		});

		it('rejects when backend request cannot be fulfilled', async () => {
			const id = 'foo';
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
			spyOn(httpService, 'get').and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));


			try {
				const future = loadBvvGeoResourceById(id);
				await future.get();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error.message).toBe(`GeoResource for id '${id}' could not be loaded`);
			}
		});

	});
});


