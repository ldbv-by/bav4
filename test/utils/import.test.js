import { $injector } from '../../src/injection';
import { VectorGeoResource, VectorSourceType } from '../../src/services/domain/geoResources';
import { MediaType } from '../../src/services/HttpService';
import { addLayer } from '../../src/store/layers/layers.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { defaultImportVectorDataOptions, detectVectorSourceType, importVectorData, importVectorDataFromUrl } from '../../src/utils/import';
import { TestUtils } from '../test-utils';



describe('provides util fuctions for importing data or services', () => {

	const httpService = {
		get() { }

	};
	const geoResourceService = {
		addOrReplace() { }
	};
	const urlService = {
		proxifyInstant() { }
	};
	let store;

	beforeEach(() => {
		store = TestUtils.setupStoreAndDi({}, {
			layers: layersReducer
		});
		$injector
			.registerSingleton('HttpService', httpService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('UrlService', urlService)
			.registerSingleton('TranslationService', { translate: (key) => key });
	});

	describe('importVectorDataFromUrl', () => {

		it('returns a GeoResourceFuture', () => {
			const url = 'http://my.url';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const geoResourceFuture = importVectorDataFromUrl(url, options);

			expect(geoResourceFuture.id).toBe(options.id);
			expect(geoResourceFuture.label).toBe(options.label);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
		});

		it('returns a GeoResourceFuture automatically setting id and label', () => {
			const url = 'http://my.url';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const geoResourceFuture = importVectorDataFromUrl(url);

			expect(geoResourceFuture.id).toEqual(jasmine.any(String));
			expect(geoResourceFuture.label).toBe('layersPlugin_store_layer_default_layer_name_future');
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
		});

		describe('GeoResourceFuture loader', () => {

			it('loads the data and returns a VectorGeoresouce', async () => {
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
				const geoResourceFuture = importVectorDataFromUrl(url, options);

				const vgr = await geoResourceFuture.get();

				expect(vgr).toEqual(jasmine.any(VectorGeoResource));
				expect(vgr.sourceType).toEqual(VectorSourceType.KML);
				expect(vgr.label).toBe(options.label);
				expect(vgr.data).toBe(data);
				expect(vgr.srid).toBe(4326);
			});

			it('updates the label property of a layer', async () => {
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
				const geoResourceFuture = importVectorDataFromUrl(url, options);
				const vgr = await geoResourceFuture.get();
				const layer = { label: options.label };
				addLayer(options.id, layer);

				vgr.opacity = .5;
				expect(store.getState().layers.active[0].label).toBe(options.label);
				vgr.label = changedLabel;
				expect(store.getState().layers.active[0].label).toBe(changedLabel);
			});


			it('loads the data and returns a VectorGeoresouce automatically setting id, label and sourceType', async () => {
				const url = 'http://my.url';
				const data = 'data';
				const mediaType = MediaType.GeoJSON;
				const detectVectorSourceTypeFunction = jasmine.createSpy().withArgs(data, mediaType).and.returnValue(VectorSourceType.GEOJSON);
				const options = {
					detectVectorSourceTypeFunction: detectVectorSourceTypeFunction
				};
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue(url);
				spyOn(httpService, 'get').withArgs(url).and.returnValue(Promise.resolve(
					new Response(data, {
						status: 200, headers: new Headers({
							'Content-Type': mediaType
						})
					})
				));
				const geoResourceFuture = importVectorDataFromUrl(url, options);

				const vgr = await geoResourceFuture.get();

				expect(vgr).toEqual(jasmine.any(VectorGeoResource));
				expect(vgr.sourceType).toEqual(VectorSourceType.GEOJSON);
				expect(vgr.id).toBe(geoResourceFuture.id);
				expect(vgr.label).toBe('layersPlugin_store_layer_default_layer_name_vector');
				expect(vgr.data).toBe(data);
				expect(vgr.srid).toBe(4326);
				expect(detectVectorSourceTypeFunction).toHaveBeenCalled();
			});

			it('throws an error when response is not ok', async (done) => {
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
				const geoResourceFuture = importVectorDataFromUrl(url, options);

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
				const url = 'http://my.url';
				const data = 'data';
				const options = {
					id: 'id',
					label: 'label'
				};
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue(url);
				spyOn(httpService, 'get').withArgs(url).and.returnValue(Promise.resolve(
					new Response(data, { status: 200 })
				));
				const geoResourceFuture = importVectorDataFromUrl(url, options);

				try {
					await geoResourceFuture.get();
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error.message).toBe(`GeoResource for '${url}' could not be loaded: SourceType could not be detected`);
					done();
				}
			});
		});
	});

	describe('importVectorData', () => {

		it('returns a VectorGeoResource', () => {
			const data = 'data';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			const vgr = importVectorData(data, options);

			expect(vgr.id).toBe(options.id);
			expect(vgr.label).toBe(options.label);
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
		});

		it('returns a VectorGeoResource automatically setting id, label and sourceType', () => {
			const data = 'data';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');
			const detectVectorSourceTypeFunction = jasmine.createSpy().withArgs(data).and.returnValue(VectorSourceType.GEOJSON);
			const options = {
				detectVectorSourceTypeFunction: detectVectorSourceTypeFunction
			};

			const vgr = importVectorData(data, options);

			expect(vgr).toEqual(jasmine.any(VectorGeoResource));
			expect(vgr.sourceType).toEqual(VectorSourceType.GEOJSON);
			expect(vgr.id).toEqual(jasmine.any(String));
			expect(vgr.label).toBe('layersPlugin_store_layer_default_layer_name_vector');
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(detectVectorSourceTypeFunction).toHaveBeenCalled();
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
		});

		it('updates the label property of a layer', async () => {
			const data = 'data';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const changedLabel = 'now';
			const layer = { label: options.label };
			addLayer(options.id, layer);
			const vgr = importVectorData(data, options);

			vgr.opacity = .5;
			expect(store.getState().layers.active[0].label).toBe(options.label);
			vgr.label = changedLabel;
			expect(store.getState().layers.active[0].label).toBe(changedLabel);
		});

		it('logs a warning and returns Null when sourceType is not available', async () => {
			const data = 'data';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');
			const warnSpy = spyOn(console, 'warn');
			const options = {
				id: 'id',
				detectVectorSourceType: () => null
			};

			const vgr = importVectorData(data, options);

			expect(vgr).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith(`SourceType for '${options.id}' could not be detected`);
			expect(geoResourceServiceSpy).not.toHaveBeenCalled();
		});
	});

	describe('detectVectorSourceType function', () => {

		it('tries to detect the source type for KML sources', async () => {
			expect(detectVectorSourceType('foo', MediaType.KML)).toBe(VectorSourceType.KML);
			expect(detectVectorSourceType('<kml some>foo</kml>')).toBe(VectorSourceType.KML);
		});

		it('tries to detect the source type for GPX sources', async () => {
			expect(detectVectorSourceType('foo', MediaType.GPX)).toBe(VectorSourceType.GPX);
			expect(detectVectorSourceType('<gpx some>foo</gpx>')).toBe(VectorSourceType.GPX);
		});

		it('tries to detect the source type for GeoJSON sources', async () => {
			expect(detectVectorSourceType('foo', MediaType.GeoJSON)).toBe(VectorSourceType.GEOJSON);
			expect(detectVectorSourceType(JSON.stringify({ type: 'foo' }))).toBe(VectorSourceType.GEOJSON);

		});

		it('returns null when type can not be detected', async () => {
			expect(detectVectorSourceType('foo')).toBeNull();
			expect(detectVectorSourceType(JSON.stringify({ some: 'foo' }))).toBeNull();
		});
	});

	describe('defaultImportVectorDataOptions', () => {

		it('contains following properties', async () => {
			expect(Object.keys(defaultImportVectorDataOptions())).toHaveSize(4);
			expect(defaultImportVectorDataOptions().id).toEqual(jasmine.any(String));
			expect(defaultImportVectorDataOptions().detectVectorSourceTypeFunction).toEqual(detectVectorSourceType);
			expect(defaultImportVectorDataOptions().label).toBeNull();
			expect(defaultImportVectorDataOptions().sourceType).toBeNull();
		});
	});
});
