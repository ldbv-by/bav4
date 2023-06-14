import { GeoResourceFuture, VectorGeoResource, VectorSourceType, WmsGeoResource } from '../../../src/domain/geoResources';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../../src/domain/sourceType';
import { $injector } from '../../../src/injection';
import { getBvvAttribution } from '../../../src/services/provider/attribution.provider';
import {
	loadBvvGeoResourceById,
	loadBvvGeoResources,
	loadExternalGeoResource,
	_definitionToGeoResource,
	_parseBvvAttributionDefinition,
	defaultVectorGeoResourceLoaderForUrl
} from '../../../src/services/provider/geoResource.provider';
import { TestUtils } from '../../test-utils';

describe('GeoResource provider', () => {
	const configService = {
		getValueAsPath() {}
	};
	const httpService = {
		async get() {}
	};
	const geoResourceService = {
		addOrReplace() {}
	};
	const sourceTypeService = {
		async forUrl() {}
	};
	const importVectorDataService = {
		async forUrl() {}
	};
	const importWmsService = {
		async forUrl() {}
	};
	const urlService = {
		proxifyInstant() {}
	};

	beforeEach(() => {
		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('SourceTypeService', sourceTypeService)
			.registerSingleton('ImportVectorDataService', importVectorDataService)
			.registerSingleton('ImportWmsService', importWmsService)
			.registerSingleton('UrlService', urlService);
	});

	const basicAttribution = {
		copyright: 'copyright'
	};

	const wmsDefinition = {
		id: 'wmsId',
		label: 'wmsLabel',
		url: 'wmsUrl',
		layers: 'wmsLayer',
		format: 'image/png',
		type: 'wms',
		attribution: basicAttribution
	};
	const wmsDefinitionOptionalProperties = {
		background: true,
		opacity: 0.5,
		hidden: true,
		minZoom: 5,
		maxZoom: 19,
		extraParams: { foo: 'bar' },
		queryable: false,
		exportable: false,
		...wmsDefinition
	};
	const xyzDefinition = { id: 'xyzId', label: 'xyzLabel', urls: 'xyzUrl', type: 'xyz', attribution: basicAttribution };
	const xyzDefinitionOptionalProperties = {
		background: true,
		opacity: 0.5,
		hidden: true,
		minZoom: 5,
		maxZoom: 19,
		queryable: false,
		exportable: false,
		tileGridId: 'tileGridId',
		...xyzDefinition
	};
	const vtDefinition = { id: 'vtId', label: 'vtLabel', url: 'vtStyleUrl', type: 'vt', attribution: basicAttribution };
	const vtDefinitionOptionalProperties = {
		background: true,
		opacity: 0.5,
		hidden: true,
		minZoom: 5,
		maxZoom: 19,
		queryable: false,
		exportable: false,
		...vtDefinition
	};
	const vectorDefinition = {
		id: 'xyzId',
		label: 'vectorLabel',
		url: 'vectorUrl',
		sourceType: 'kml',
		type: 'vector',
		attribution: basicAttribution
	};
	const vectorDefinitionOptionalProperties = {
		clusterParams: { foo: 'bar' },
		background: true,
		opacity: 0.5,
		hidden: true,
		minZoom: 5,
		maxZoom: 19,
		queryable: false,
		exportable: false,
		...vectorDefinition
	};
	const aggregateDefinition = {
		id: 'xyzId',
		label: 'aggregateLabel',
		geoResourceIds: ['xyzId', 'wmsId'],
		type: 'aggregate',
		attribution: basicAttribution
	};
	const aggregateDefinitionOptionalProperties = {
		background: true,
		opacity: 0.5,
		hidden: true,
		minZoom: 5,
		maxZoom: 19,
		queryable: false,
		exportable: false,
		...aggregateDefinition
	};

	const validateGeoResourceProperties = (georesource, definition) => {
		expect(georesource.id).toBe(definition.id);
		expect(georesource.label).toBe(definition.label);
		expect(georesource.opacity).toBe(1.0);
		expect(georesource.hidden).toBeFalse();
		expect(georesource.queryable).toBeTrue();
		expect(Symbol.keyFor(georesource.getType())).toBe(definition.type);
	};

	describe('_definitionToGeoResource', () => {
		beforeEach(() => {
			spyOn(configService, 'getValueAsPath').and.returnValue('https://backend.url/');
		});

		it('maps a unknown BVV definition to a corresponding GeoResource instance', () => {
			expect(_definitionToGeoResource({ type: 'unknown' })).toBeNull();
		});

		it('maps a WMS BVV definition to a corresponding GeoResource instance', () => {
			const wmsGeoResource = _definitionToGeoResource(wmsDefinition);

			validateGeoResourceProperties(wmsGeoResource, wmsDefinition);
			expect(wmsGeoResource.url).toBe('wmsUrl');
			expect(wmsGeoResource.layers).toBe(wmsDefinition.layers);
			expect(wmsGeoResource.format).toBe(wmsDefinition.format);
			expect(wmsGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(wmsGeoResource._attribution).not.toBeNull();
		});

		it('maps a WMS BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const wmsGeoResource = _definitionToGeoResource(wmsDefinitionOptionalProperties);

			expect(wmsGeoResource.opacity).toBe(0.5);
			expect(wmsGeoResource.hidden).toBeTrue();
			expect(wmsGeoResource.minZoom).toBe(5);
			expect(wmsGeoResource.maxZoom).toBe(19);
			expect(wmsGeoResource.extraParams).toEqual({ foo: 'bar' });
			expect(wmsGeoResource.queryable).toBeFalse();
			expect(wmsGeoResource.exportable).toBeFalse();
		});

		it('maps a XYZ BVV definition to a corresponding GeoResource instance', () => {
			const xyzGeoResource = _definitionToGeoResource(xyzDefinition);

			validateGeoResourceProperties(xyzGeoResource, xyzDefinition);
			expect(xyzGeoResource.urls).toBe('xyzUrl');
			expect(xyzGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(xyzGeoResource._attribution).not.toBeNull();
		});

		it('maps a XYZ BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const xyzGeoResource = _definitionToGeoResource(xyzDefinitionOptionalProperties);

			expect(xyzGeoResource.opacity).toBe(0.5);
			expect(xyzGeoResource.hidden).toBeTrue();
			expect(xyzGeoResource.minZoom).toBe(5);
			expect(xyzGeoResource.maxZoom).toBe(19);
			expect(xyzGeoResource.queryable).toBeFalse();
			expect(xyzGeoResource.exportable).toBeFalse();
			expect(xyzGeoResource.tileGridId).toBe('tileGridId');
		});

		it('maps a VT BVV definition to a corresponding GeoResource instance', () => {
			const vtGeoResource = _definitionToGeoResource(vtDefinition);

			validateGeoResourceProperties(vtGeoResource, vtDefinition);
			expect(vtGeoResource.styleUrl).toBe('vtStyleUrl');
			expect(vtGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(vtGeoResource._attribution).not.toBeNull();
		});

		it('maps a VT BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const vtGeoResource = _definitionToGeoResource(vtDefinitionOptionalProperties);

			expect(vtGeoResource.opacity).toBe(0.5);
			expect(vtGeoResource.hidden).toBeTrue();
			expect(vtGeoResource.minZoom).toBe(5);
			expect(vtGeoResource.maxZoom).toBe(19);
			expect(vtGeoResource.queryable).toBeFalse();
			expect(vtGeoResource.exportable).toBeFalse();
		});

		it('maps a VectorFile BVV definition to a corresponding GeoResource instance', async () => {
			const data = 'data';
			spyOn(urlService, 'proxifyInstant').withArgs(vectorDefinition.url).and.returnValue(vectorDefinition.url);
			spyOn(httpService, 'get')
				.withArgs(vectorDefinition.url, { timeout: 5000 })
				.and.returnValue(Promise.resolve(new Response(data, { status: 200 })));
			spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);

			const vectorGeoResource = await _definitionToGeoResource(vectorDefinition).get();

			validateGeoResourceProperties(vectorGeoResource, vectorDefinition);
			expect(vectorGeoResource.data).toBe(data);
			expect(vectorGeoResource.sourceType).toBe(Symbol.for(vectorDefinition.sourceType));
			expect(vectorGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(vectorGeoResource._attribution).not.toBeNull();
		});

		it('maps a VectorFile BVV definition with optional properties to a corresponding GeoResource instance', async () => {
			const data = 'data';
			spyOn(urlService, 'proxifyInstant').withArgs(vectorDefinition.url).and.returnValue(vectorDefinitionOptionalProperties.url);
			spyOn(httpService, 'get')
				.withArgs(vectorDefinition.url, { timeout: 5000 })
				.and.returnValue(Promise.resolve(new Response(data, { status: 200 })));
			spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);

			const vectorGeoResource = await _definitionToGeoResource(vectorDefinitionOptionalProperties).get();

			expect(vectorGeoResource.opacity).toBe(0.5);
			expect(vectorGeoResource.hidden).toBeTrue();
			expect(vectorGeoResource.minZoom).toBe(5);
			expect(vectorGeoResource.maxZoom).toBe(19);
			expect(vectorGeoResource.clusterParams).toEqual({ foo: 'bar' });
			expect(vectorGeoResource.queryable).toBeFalse();
			expect(vectorGeoResource.exportable).toBeFalse();
		});

		it('throws an Error when GeoResourceFuture for a VectorGeoResource cannot be resolved', async () => {
			spyOn(urlService, 'proxifyInstant').withArgs(vectorDefinition.url).and.returnValue(vectorDefinition.url);
			spyOn(httpService, 'get')
				.withArgs(vectorDefinition.url, { timeout: 5000 })
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));
			spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);

			await expectAsync(_definitionToGeoResource(vectorDefinition).get()).toBeRejectedWithError(
				`GeoResource for '${vectorDefinition.url}' could not be loaded: Http-Status 404`
			);
		});

		it('maps a aggregate BVV definition to a corresponding GeoResource instance', () => {
			const aggregateGeoResource = _definitionToGeoResource(aggregateDefinition);

			validateGeoResourceProperties(aggregateGeoResource, aggregateDefinition);
			expect(aggregateGeoResource.geoResourceIds).toEqual(aggregateDefinition.geoResourceIds);
			expect(aggregateGeoResource._attributionProvider).toBe(getBvvAttribution);
			expect(aggregateGeoResource._attribution).not.toBeNull();
		});

		it('maps a aggregate BVV definition with optional properties to a corresponding GeoResource instance', () => {
			const aggregateGeoResource = _definitionToGeoResource(aggregateDefinitionOptionalProperties);

			expect(aggregateGeoResource.opacity).toBe(0.5);
			expect(aggregateGeoResource.hidden).toBeTrue();
			expect(aggregateGeoResource.minZoom).toBe(5);
			expect(aggregateGeoResource.maxZoom).toBe(19);
			expect(aggregateGeoResource.queryable).toBeFalse();
			expect(aggregateGeoResource.exportable).toBeFalse();
		});
	});

	describe('_parseBvvAttributionDefinition', () => {
		it('returns null when basic attribution definition is missing', () => {
			const result = _parseBvvAttributionDefinition({});

			expect(result).toBeNull();
		});

		it('parses a basic attribution definition', () => {
			const attribution = {
				copyright: [
					{
						label: 'label',
						url: 'url'
					}
				],
				description: 'description'
			};
			const result = _parseBvvAttributionDefinition({ attribution });

			expect(result).toEqual(attribution);
		});

		it('parses extended attribution definitions', () => {
			const attributionDefinition = {
				attribution: {
					copyright: [
						{
							label: 'label',
							url: 'url'
						}
					],
					description: 'description'
				},
				extendedAttributions: [
					{},
					{
						copyright: [
							{
								label: 'label1',
								url: 'url1'
							}
						],
						description: 'description1'
					},
					{
						description: 'description2'
					}
				]
			};
			const result = _parseBvvAttributionDefinition(attributionDefinition);

			expect(result.length).toBe(3);
			//completely from basic attribution definition
			expect(result[0]).toEqual({
				copyright: [
					{
						label: 'label',
						url: 'url'
					}
				],
				description: 'description'
			});
			//completely from extended attribution definition
			expect(result[1]).toEqual({
				copyright: [
					{
						label: 'label1',
						url: 'url1'
					}
				],
				description: 'description1'
			});
			//partially from extended attribution definition
			expect(result[2]).toEqual({
				copyright: [
					{
						label: 'label',
						url: 'url'
					}
				],
				description: 'description2'
			});
		});

		it('sets extended attribution properties to NULL when not available', () => {
			const attributionDefinition = {
				attribution: {},
				extendedAttributions: [{}]
			};
			const result = _parseBvvAttributionDefinition(attributionDefinition);

			expect(result.length).toBe(1);
			expect(result[0]).toEqual({
				copyright: null,
				description: null
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
			const configServiceSpy = spyOn(configService, 'getValueAsPath')
				.withArgs('BACKEND_URL')
				.and.returnValue(backendUrl + '/');
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0, expectedArgs1)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify([wmsDefinition, xyzDefinition, vectorDefinition, aggregateDefinition]))));

			const georesources = await loadBvvGeoResources();

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(georesources.length).toBe(4);

			const wmsGeoResource = georesources[0];
			validateGeoResourceProperties(wmsGeoResource, wmsDefinition);

			const xyzGeoResource = georesources[1];
			validateGeoResourceProperties(xyzGeoResource, xyzDefinition);

			const geoResourceFutureForVectorGeoResource /** Is's a GeoResourceFuture! */ = georesources[2];
			validateGeoResourceProperties(geoResourceFutureForVectorGeoResource, { ...vectorDefinition, type: 'future' });

			const aggregateGeoResource = georesources[3];
			validateGeoResourceProperties(aggregateGeoResource, aggregateDefinition);
		});

		it('logs a warn statement when GeoResource type cannot be resolved', async () => {
			const warnSpy = spyOn(console, 'warn');
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
			spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(JSON.stringify([{ id: 'someId', type: 'somethingUnknown' }]))));

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
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0, expectedArgs1)
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

			await expectAsync(loadBvvGeoResources()).toBeRejectedWithError('GeoResources could not be loaded');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('loadBvvGeoResourceById', () => {
		it('loads a GeoResource by id', async () => {
			const backendUrl = 'https://backend.url';
			const expectedArgs0 = `${backendUrl}/georesources/byId/${wmsDefinition.id}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath')
				.withArgs('BACKEND_URL')
				.and.returnValue(backendUrl + '/');
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify(wmsDefinition))));

			const future = loadBvvGeoResourceById(wmsDefinition.id);
			const geoResource = await future.get();

			expect(future.id).toBe(wmsDefinition.id);
			expect(future.label).toBeNull();
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(geoResource.id).toBe(wmsDefinition.id);
		});

		it('rejects when type is unknown', async () => {
			const id = 'foo';
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
			spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(JSON.stringify({ id: id, type: 'somethingUnknown' }))));
			const future = loadBvvGeoResourceById(id);

			await expectAsync(future.get()).toBeRejectedWithError(`GeoResource for id '${id}' could not be loaded`);
		});

		it('rejects when backend request cannot be fulfilled', async () => {
			const id = 'foo';
			const backendUrl = 'https://backend.url';
			spyOn(configService, 'getValueAsPath').and.returnValue(backendUrl);
			spyOn(httpService, 'get').and.returnValue(Promise.resolve(new Response(null, { status: 404 })));
			const future = loadBvvGeoResourceById(id);

			await expectAsync(future.get()).toBeRejectedWithError(`GeoResource for id '${id}' could not be loaded`);
		});
	});

	describe('loadExternalGeoResource', () => {
		describe('Vector Url', () => {
			it('loads a GEOJSON GeoResource', async () => {
				const label = 'label';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.GEOJSON);
				const geoResourceId = `${url}`;
				const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.GEOJSON);
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forUrl')
					.withArgs(url)
					.and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				const geoResourceFuture = new GeoResourceFuture(geoResourceId, async () => geoResource);
				const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				const importVectorDataServiceSpy = spyOn(importVectorDataService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, id: geoResourceId })
					.and.returnValue(geoResourceFuture);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(importVectorDataServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});

			it('loads a KML GeoResource', async () => {
				const label = 'label';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.KML);
				const geoResourceId = `${url}`;
				const geoResource = new VectorGeoResource(geoResourceId, label, VectorSourceType.GEOJSON);
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forUrl')
					.withArgs(url)
					.and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				const geoResourceFuture = new GeoResourceFuture(geoResourceId, async () => geoResource);
				const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				const importVectorDataServiceSpy = spyOn(importVectorDataService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, id: geoResourceId })
					.and.returnValue(geoResourceFuture);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(importVectorDataServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});

			it('loads a GPX GeoResource', async () => {
				const label = 'label';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.KML);
				const geoResourceId = `${url}`;
				const geoResource = new VectorGeoResource(geoResourceId, label, VectorSourceType.GPX);
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forUrl')
					.withArgs(url)
					.and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				const geoResourceFuture = new GeoResourceFuture(geoResourceId, async () => geoResource);
				const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				const importVectorDataServiceSpy = spyOn(importVectorDataService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, id: geoResourceId })
					.and.returnValue(geoResourceFuture);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(importVectorDataServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});

			it('loads a EWKT GeoResource', async () => {
				const label = 'label';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.KML);
				const geoResourceId = `${url}`;
				const geoResource = new VectorGeoResource(geoResourceId, label, VectorSourceType.EWKT);
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forUrl')
					.withArgs(url)
					.and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				const geoResourceFuture = new GeoResourceFuture(geoResourceId, async () => geoResource);
				const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				const importVectorDataServiceSpy = spyOn(importVectorDataService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, id: geoResourceId })
					.and.returnValue(geoResourceFuture);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(importVectorDataServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});

			it('sets the GeoResource label when provided', async () => {
				const label = 'label';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.KML);
				const geoResourceId = `${url}||${label}`;
				const geoResource = new VectorGeoResource(geoResourceId, 'some label', VectorSourceType.EWKT);
				spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				const geoResourceFuture = new GeoResourceFuture(geoResourceId, async () => geoResource);
				spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				spyOn(importVectorDataService, 'forUrl').withArgs(url, { sourceType: sourceType, id: geoResourceId }).and.returnValue(geoResourceFuture);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
			});
		});

		describe('WMS Url', () => {
			it('loads a WMS GeoResource', async () => {
				const label = 'label';
				const layer = 'layer';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.WMS, '1.1.1');
				const geoResourceId = `${url}||${layer}`;
				const geoResource = new WmsGeoResource(geoResourceId, label, url, layer, 'image/png');
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forUrl')
					.withArgs(url)
					.and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				const importWmsServiceSpy = spyOn(importWmsService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, layers: [layer], ids: [geoResourceId], isAuthenticated: false })
					.and.returnValue([geoResource]);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(importWmsServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});

			it('loads an authenticated WMS GeoResource', async () => {
				const label = 'label';
				const layer = 'layer';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.WMS, '1.1.1');
				const geoResourceId = `${url}||${layer}`;
				const geoResource = new WmsGeoResource(geoResourceId, label, url, layer, 'image/png');
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forUrl')
					.withArgs(url)
					.and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.BAA_AUTHENTICATED, sourceType));
				const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				const importWmsServiceSpy = spyOn(importWmsService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, layers: [layer], ids: [geoResourceId], isAuthenticated: true })
					.and.returnValue([geoResource]);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(importWmsServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});

			it('returns the first GeoResource provided by the ImportService when no layer is available', async () => {
				const label = 'label';
				const layer = 'layer';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.WMS, '1.1.1');
				const geoResourceId = `${url}`;
				const geoResource0 = new WmsGeoResource(geoResourceId, label, url, layer, 'image/png');
				const geoResource1 = new WmsGeoResource('otherGeoResourceId', label, url, 'otherLayer', 'image/png');
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forUrl')
					.withArgs(url)
					.and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				const importWmsServiceSpy = spyOn(importWmsService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, layers: [], ids: [geoResourceId], isAuthenticated: false })
					.and.returnValue([geoResource0, geoResource1]);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource0);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(importWmsServiceSpy).toHaveBeenCalled();
				expect(geoResourceServiceSpy).toHaveBeenCalled();
			});

			it('sets the GeoResource label when provided', async () => {
				const label = 'label';
				const layer = 'layer';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.WMS, '1.1.1');
				const geoResourceId = `${url}||${layer}||${label}`;
				const geoResource = new WmsGeoResource(geoResourceId, 'some label', url, layer, 'image/png');
				spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				spyOn(importWmsService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, layers: [layer], ids: [geoResourceId], isAuthenticated: false })
					.and.returnValue([geoResource]);

				const future = loadExternalGeoResource(geoResourceId);
				const resolvedGeoResource = await future.get();

				expect(future.id).toBe(geoResourceId);
				expect(future.label).toBeNull();
				expect(resolvedGeoResource).toEqual(geoResource);
				expect(resolvedGeoResource.id).toBe(geoResourceId);
				expect(resolvedGeoResource.label).toBe(label);
			});

			it('throws an error when no WmsGeoResource was created', async () => {
				const layer = 'layer';
				const url = 'http://foo.bar';
				const sourceType = new SourceType(SourceTypeName.WMS, '1.1.1');
				const geoResourceId = `${url}||${layer}`;
				spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
				spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
				spyOn(importWmsService, 'forUrl')
					.withArgs(url, { sourceType: sourceType, layers: [layer], ids: [geoResourceId], isAuthenticated: false })
					.and.returnValue([]);

				const future = loadExternalGeoResource(geoResourceId);

				await expectAsync(future.get()).toBeRejectedWithError("Unsupported WMS: 'http://foo.bar'");
			});
		});

		it('throws an error when source type is not supported', async () => {
			const url = 'http://foo.bar';
			const sourceType = new SourceType({ FOO: 'bar' });
			const geoResourceId = `${url}`;
			const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.EWKT);
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OK, sourceType));
			const geoResourceFuture = new GeoResourceFuture(geoResourceId, async () => geoResource);
			spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
			spyOn(importVectorDataService, 'forUrl').withArgs(url, { sourceType: sourceType, id: geoResourceId }).and.returnValue(geoResourceFuture);

			const future = loadExternalGeoResource(geoResourceId);

			await expectAsync(future.get()).toBeRejectedWithError("Unsupported source type 'FOO'");
		});

		it('throws an error when SourceType status is not OK', async () => {
			const url = 'http://foo.bar';
			const sourceType = new SourceType(SourceTypeName.KML);
			const geoResourceId = `${url}`;
			const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.EWKT);
			spyOn(sourceTypeService, 'forUrl').withArgs(url).and.resolveTo(new SourceTypeResult(SourceTypeResultStatus.OTHER, sourceType));
			const geoResourceFuture = new GeoResourceFuture(geoResourceId, async () => geoResource);
			spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);
			spyOn(importVectorDataService, 'forUrl').withArgs(url, { sourceType: sourceType, id: geoResourceId }).and.returnValue(geoResourceFuture);

			const future = loadExternalGeoResource(geoResourceId);

			await expectAsync(future.get()).toBeRejectedWithError('SourceTypeService returns status=OTHER for http://foo.bar');
		});

		it('returns NULL when id does not contain a valid URL', async () => {
			const url = 'foo.bar';
			const geoResourceId = `${url}`;

			const future = loadExternalGeoResource(geoResourceId);

			expect(future).toBeNull();
		});

		it('returns NULL when id does not contain a URL', async () => {
			const geoResourceId = 'some';

			const future = loadExternalGeoResource(geoResourceId);

			expect(future).toBeNull();
		});
	});

	describe('defaultVectorGeoResourceLoaderForUrl', () => {
		it('returns an GeoResourceLoader resolving to a VectorGeoResource', async () => {
			const data = 'data';
			spyOn(httpService, 'get')
				.withArgs(vectorDefinition.url, { timeout: 5000 })
				.and.returnValue(Promise.resolve(new Response(data, { status: 200 })));
			spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);

			const vectorGeoResource = await defaultVectorGeoResourceLoaderForUrl(
				vectorDefinition.url,
				Symbol.for(vectorDefinition.sourceType),
				vectorDefinition.id,
				vectorDefinition.label
			)();

			expect(vectorGeoResource.id).toBe(vectorDefinition.id);
			expect(vectorGeoResource.label).toBe(vectorDefinition.label);
			expect(vectorGeoResource.data).toBe(data);
			expect(vectorGeoResource.srid).toBe(4326);
			expect(Symbol.keyFor(vectorGeoResource.sourceType)).toBe(vectorDefinition.sourceType);
		});

		it('returns an GeoResourceLoader resolving to a VectorGeoResource', async () => {
			const data = 'data';
			spyOn(httpService, 'get')
				.withArgs(vectorDefinition.url, { timeout: 5000 })
				.and.returnValue(Promise.resolve(new Response(data, { status: 200 })));
			spyOn(geoResourceService, 'addOrReplace').and.callFake((gr) => gr);

			const vectorGeoResource = await defaultVectorGeoResourceLoaderForUrl(vectorDefinition.url, Symbol.for(vectorDefinition.sourceType))();

			expect(vectorGeoResource.id).not.toBeNull();
			expect(vectorGeoResource.label).not.toBeNull();
			expect(vectorGeoResource.data).toBe(data);
			expect(vectorGeoResource.srid).toBe(4326);
			expect(Symbol.keyFor(vectorGeoResource.sourceType)).toBe(vectorDefinition.sourceType);
		});

		it('returns an GeoResourceLoader throwing an Error when resource is not available', async () => {
			spyOn(httpService, 'get')
				.withArgs(vectorDefinition.url, { timeout: 5000 })
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

			await expectAsync(defaultVectorGeoResourceLoaderForUrl(vectorDefinition.url, vectorDefinition.sourceType)()).toBeRejectedWithError(
				`GeoResource for '${vectorDefinition.url}' could not be loaded: Http-Status 404`
			);
		});
	});
});
