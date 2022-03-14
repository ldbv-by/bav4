import { $injector } from '../../src/injection';
import { VectorGeoResource, VectorSourceType } from '../../src/services/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/services/domain/sourceType';
import { MediaType } from '../../src/services/HttpService';
import { ImportVectorDataService } from '../../src/services/ImportVectorDataService';
import { addLayer } from '../../src/store/layers/layers.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { TestUtils } from '../test-utils';

describe('ImportVectorDataService', () => {

	const httpService = {
		get() { }
	};
	const geoResourceService = {
		addOrReplace() { }
	};
	const urlService = {
		proxifyInstant() { }
	};
	const sourceTypeService = {
		forData() { }
	};
	let store;

	const setup = () => {
		store = TestUtils.setupStoreAndDi({}, {
			layers: layersReducer
		});
		$injector
			.registerSingleton('HttpService', httpService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('UrlService', urlService)
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SourceTypeService', sourceTypeService);
		return new ImportVectorDataService();
	};

	describe('forUrl', () => {

		it('returns a GeoResourceFuture for given VectorSourceType', () => {
			const instanceUnderTest = setup();
			const url = 'http://my.url';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const geoResourceFuture = instanceUnderTest.forUrl(url, options);

			expect(geoResourceFuture.id).toBe(options.id);
			expect(geoResourceFuture.label).toBe(options.label);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
		});

		it('returns a GeoResourceFuture for given SourceType', () => {
			const instanceUnderTest = setup();
			const url = 'http://my.url';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: new SourceType(SourceTypeName.KML)
			};
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const geoResourceFuture = instanceUnderTest.forUrl(url, options);

			expect(geoResourceFuture.id).toBe(options.id);
			expect(geoResourceFuture.label).toBe(options.label);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
		});

		it('returns a GeoResourceFuture automatically setting id and label', () => {
			const instanceUnderTest = setup();
			const url = 'http://my.url';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const geoResourceFuture = instanceUnderTest.forUrl(url);

			expect(geoResourceFuture.id).toEqual(jasmine.any(String));
			expect(geoResourceFuture.label).toBe('layersPlugin_store_layer_default_layer_name_future');
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
		});

		describe('GeoResourceFuture loader', () => {

			it('loads the data and returns a VectorGeoresouce', async () => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const options = {
					id: 'id',
					label: 'label',
					sourceType: VectorSourceType.KML
				};
				const data = 'data';
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue(url);
				spyOn(httpService, 'get').withArgs(url).and.returnValue(Promise.resolve(
					new Response(data, { status: 200 })
				));
				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				const vgr = await geoResourceFuture.get();

				expect(vgr).toEqual(jasmine.any(VectorGeoResource));
				expect(vgr.sourceType).toEqual(VectorSourceType.KML);
				expect(vgr.label).toBe(options.label);
				expect(vgr.data).toBe(data);
				expect(vgr.srid).toBe(4326);
			});

			it('updates the label property of a layer', async () => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const changedLabel = 'now';
				const data = 'data';
				const options = {
					id: 'id',
					label: 'label',
					sourceType: VectorSourceType.KML
				};
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue(url);
				spyOn(httpService, 'get').withArgs(url).and.returnValue(Promise.resolve(
					new Response(data, { status: 200 })
				));
				const geoResourceFuture = instanceUnderTest.forUrl(url, options);
				const vgr = await geoResourceFuture.get();
				const layer = { label: options.label };
				addLayer(options.id, layer);

				vgr.setOpacity(.5);
				expect(store.getState().layers.active[0].label).toBe(options.label);
				vgr.setLabel(changedLabel);
				expect(store.getState().layers.active[0].label).toBe(changedLabel);
			});

			it('loads the data and returns a VectorGeoresouce automatically setting id, label and sourceType', async () => {
				const url = 'http://my.url';
				const data = 'data';
				const mediaType = MediaType.GeoJSON;
				const instanceUnderTest = setup();
				const sourceType = new SourceType(SourceTypeName.GEOJSON, mediaType);
				const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forData').withArgs(data, mediaType).and.returnValue(sourceType);
				const _mapSourceTypetoVectorSourceTypeSpy = spyOn(instanceUnderTest, '_mapSourceTypetoVectorSourceType')
					.and.callFake(sourceType => sourceType ? VectorSourceType.GEOJSON : null);

				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue(url);
				spyOn(httpService, 'get').withArgs(url).and.returnValue(Promise.resolve(
					new Response(data, {
						status: 200, headers: new Headers({
							'Content-Type': mediaType
						})
					})
				));
				const geoResourceFuture = instanceUnderTest.forUrl(url);

				const vgr = await geoResourceFuture.get();

				expect(vgr).toEqual(jasmine.any(VectorGeoResource));
				expect(vgr.sourceType).toEqual(VectorSourceType.GEOJSON);
				expect(vgr.id).toBe(geoResourceFuture.id);
				expect(vgr.label).toBe('layersPlugin_store_layer_default_layer_name_vector');
				expect(vgr.data).toBe(data);
				expect(vgr.srid).toBe(4326);
				expect(sourceTypeServiceSpy).toHaveBeenCalled();
				expect(_mapSourceTypetoVectorSourceTypeSpy).toHaveBeenCalledTimes(2);
			});

			it('throws an error when response is not ok', async (done) => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const status = 404;
				const options = {
					id: 'id',
					label: 'label',
					sourceType: VectorSourceType.KML
				};
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue(url);
				spyOn(httpService, 'get').withArgs(url).and.returnValue(Promise.resolve(
					new Response(null, { status: status })
				));
				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				try {
					await geoResourceFuture.get();
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error.message).toBe(`GeoResource for '${url}' could not be loaded: Http-Status ${status}`);
					done();
				}
			});

			it('throws an error when sourceType is not available', async (done) => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const data = 'data';
				const options = {
					id: 'id',
					label: 'label'
				};
				spyOn(instanceUnderTest, '_mapSourceTypetoVectorSourceType').and.returnValue(null);
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue(url);
				spyOn(httpService, 'get').withArgs(url).and.returnValue(Promise.resolve(
					new Response(data, { status: 200 })
				));
				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				try {
					await geoResourceFuture.get();
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error.message).toBe(`GeoResource for '${url}' could not be loaded: SourceType could not be detected`);
					done();
				}
			});

			it('returns NULL when source type is not supported', () => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const warnSpy = spyOn(console, 'warn');
				const options = {
					id: 'id',
					sourceType: 'foo'
				};

				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				expect(geoResourceFuture).toBeNull();
				expect(warnSpy).toHaveBeenCalledWith(`SourceType '${options.sourceType}' for '${options.id}' is not supported`);
			});
		});
	});

	describe('_mapSourceTypetoVectorSourceType', () => {

		it('maps a SourceType to a VectorSourceType', () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest._mapSourceTypetoVectorSourceType()).toBeNull();
			expect(instanceUnderTest._mapSourceTypetoVectorSourceType(new SourceType(SourceTypeName.KML))).toBe(VectorSourceType.KML);
			expect(instanceUnderTest._mapSourceTypetoVectorSourceType(new SourceType(SourceTypeName.GPX))).toBe(VectorSourceType.GPX);
			expect(instanceUnderTest._mapSourceTypetoVectorSourceType(new SourceType(SourceTypeName.GEOJSON))).toBe(VectorSourceType.GEOJSON);
			expect(instanceUnderTest._mapSourceTypetoVectorSourceType(VectorSourceType.KML)).toBe(VectorSourceType.KML);
			expect(instanceUnderTest._mapSourceTypetoVectorSourceType(VectorSourceType.GPX)).toBe(VectorSourceType.GPX);
			expect(instanceUnderTest._mapSourceTypetoVectorSourceType(VectorSourceType.GEOJSON)).toBe(VectorSourceType.GEOJSON);
			expect(instanceUnderTest._mapSourceTypetoVectorSourceType(new SourceType('foo'))).toBeNull();
		});
	});

	describe('forData', () => {

		it('returns a VectorGeoResource for given VectorSourceType', () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const vgr = instanceUnderTest.forData(data, options);

			expect(vgr.id).toBe(options.id);
			expect(vgr.label).toBe(options.label);
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
		});

		it('returns a VectorGeoResource for given SourceType', () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: new SourceType(SourceTypeName.KML)
			};
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const vgr = instanceUnderTest.forData(data, options);

			expect(vgr.id).toBe(options.id);
			expect(vgr.label).toBe(options.label);
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
		});

		it('returns a VectorGeoResource automatically setting id, label and sourceType', () => {
			const data = 'data';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');
			const instanceUnderTest = setup();
			const sourceType = new SourceType(SourceTypeName.GEOJSON);
			const sourceTypeServiceSpy = spyOn(sourceTypeService, 'forData').withArgs(data).and.returnValue(sourceType);
			const _mapSourceTypetoVectorSourceTypeSpy = spyOn(instanceUnderTest, '_mapSourceTypetoVectorSourceType')
				.and.callFake(sourceType => sourceType ? VectorSourceType.GEOJSON : null);

			const vgr = instanceUnderTest.forData(data);

			expect(vgr).toEqual(jasmine.any(VectorGeoResource));
			expect(vgr.sourceType).toEqual(VectorSourceType.GEOJSON);
			expect(vgr.id).toEqual(jasmine.any(String));
			expect(vgr.label).toBe('layersPlugin_store_layer_default_layer_name_vector');
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
			expect(sourceTypeServiceSpy).toHaveBeenCalled();
			expect(_mapSourceTypetoVectorSourceTypeSpy).toHaveBeenCalledTimes(2);
		});

		it('updates the label property of a layer', async () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const changedLabel = 'now';
			const layer = { label: options.label };
			addLayer(options.id, layer);
			const vgr = instanceUnderTest.forData(data, options);

			vgr.setOpacity(.5);
			expect(store.getState().layers.active[0].label).toBe(options.label);
			vgr.setLabel(changedLabel);
			expect(store.getState().layers.active[0].label).toBe(changedLabel);
		});

		it('logs a warning and returns Null when sourceType is not available', async () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');
			const warnSpy = spyOn(console, 'warn');
			const options = {
				id: 'id',
				detectVectorSourceType: () => null
			};

			const vgr = instanceUnderTest.forData(data, options);

			expect(vgr).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith(`SourceType for '${options.id}' could not be detected`);
			expect(geoResourceServiceSpy).not.toHaveBeenCalled();
		});

		it('logs a warning and returns Null when sourceType is not is not supported', async () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');
			const warnSpy = spyOn(console, 'warn');
			const options = {
				id: 'id',
				sourceType: 'foo'
			};

			const vgr = instanceUnderTest.forData(data, options);

			expect(vgr).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith(`SourceType for '${options.id}' could not be detected`);
			expect(geoResourceServiceSpy).not.toHaveBeenCalled();
		});
	});

	describe('_newDefaultImportVectorDataOptions', () => {

		it('contains following properties', async () => {
			const instanceUnderTest = setup();
			expect(Object.keys(instanceUnderTest._newDefaultImportVectorDataOptions())).toHaveSize(3);
			expect(instanceUnderTest._newDefaultImportVectorDataOptions().id).toEqual(jasmine.any(String));
			expect(instanceUnderTest._newDefaultImportVectorDataOptions().label).toBeNull();
			expect(instanceUnderTest._newDefaultImportVectorDataOptions().sourceType).toBeNull();
		});
	});
});
