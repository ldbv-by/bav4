import { $injector } from '@src/injection';
import { VectorGeoResource, VectorSourceType } from '@src/domain/geoResources';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '@src/domain/sourceType';
import { MediaType } from '@src/domain/mediaTypes';
import { ImportVectorDataService } from '@src/services/ImportVectorDataService';
import { TestUtils } from '@test/test-utils';
import {
	getAttributionForLocallyImportedOrCreatedGeoResource,
	getAttributionProviderForGeoResourceImportedByUrl
} from '@src/services/provider/attribution.provider';
import { UnavailableGeoResourceError } from '@src/domain/errors';

describe('ImportVectorDataService', () => {
	const httpService = {
		get() {}
	};
	const geoResourceService = {
		addOrReplace() {}
	};
	const urlService = {
		proxifyInstant() {}
	};
	const sourceTypeService = {
		forData() {}
	};

	const setup = () => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('HttpService', httpService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('UrlService', urlService)
			.registerSingleton('SourceTypeService', sourceTypeService);
		return new ImportVectorDataService();
	};

	const handledByGeoResourceServiceMarker = 'marker';
	const addOrReplaceMethodMock = (gr) => {
		gr.marker = handledByGeoResourceServiceMarker;
		return gr;
	};

	afterEach(() => {
		$injector.reset();
	});

	describe('forUrl', () => {
		it('returns a GeoResourceFuture', () => {
			const instanceUnderTest = setup();
			const url = 'http://my.url';
			const options = {
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);

			const geoResourceFuture = instanceUnderTest.forUrl(url, options);

			expect(geoResourceFuture.id).toBe(url);
			expect(geoResourceFuture.label).toBeNull();
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
			expect(geoResourceFuture.marker).toBe(handledByGeoResourceServiceMarker);
		});

		it('returns a GeoResourceFuture for given ID', () => {
			const instanceUnderTest = setup();
			const url = 'http://my.url';
			const options = {
				id: 'http://my.url||foo||true',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);

			const geoResourceFuture = instanceUnderTest.forUrl(url, options);

			expect(geoResourceFuture.id).toBe(options.id);
			expect(geoResourceFuture.label).toBeNull();
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
			expect(geoResourceFuture.marker).toBe(handledByGeoResourceServiceMarker);
		});

		it('returns a GeoResourceFuture for given VectorSourceType', () => {
			const instanceUnderTest = setup();
			const url = 'http://my.url';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);

			const geoResourceFuture = instanceUnderTest.forUrl(url, options);

			expect(geoResourceFuture.id).toBe(options.id);
			expect(geoResourceFuture.label).toBeNull();
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
			expect(geoResourceFuture.marker).toBe(handledByGeoResourceServiceMarker);
		});

		it('returns a GeoResourceFuture for given SourceType', () => {
			const instanceUnderTest = setup();
			const url = 'http://my.url';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: new SourceType(SourceTypeName.KML)
			};
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);

			const geoResourceFuture = instanceUnderTest.forUrl(url, options);

			expect(geoResourceFuture.id).toBe(options.id);
			expect(geoResourceFuture.label).toBeNull();
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceFuture);
			expect(geoResourceFuture.marker).toBe(handledByGeoResourceServiceMarker);
		});

		describe('GeoResourceFuture loader', () => {
			it('loads the data and returns a VectorGeoresource', async () => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const options = {
					id: 'id',
					label: 'label',
					sourceType: VectorSourceType.KML
				};
				const data = 'data';
				const sourceTypeResult = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML));
				const urlServiceSpy = vi.spyOn(urlService, 'proxifyInstant').mockReturnValue(url);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(data, { status: 200 }));
				const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData').mockReturnValue(sourceTypeResult);
				vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				const vgr = await geoResourceFuture.get();

				expect(vgr).toEqual(expect.any(VectorGeoResource));
				expect(vgr.sourceType).toEqual(VectorSourceType.KML);
				expect(vgr.label).toBe(options.label);
				expect(vgr.data).toBe(data);
				expect(vgr.srid).toBe(4326);
				expect(vgr.getAttribution()).toEqual([getAttributionProviderForGeoResourceImportedByUrl(url)(vgr)]);
				expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
				expect(sourceTypeServiceSpy).toHaveBeenCalledWith(data);
				expect(urlServiceSpy).toHaveBeenCalledWith(url);
				expect(httpServiceSpy).toHaveBeenCalledWith(url);
			});

			it('loads the data and returns a VectorGeoresource automatically setting id, sourceType and SRID', async () => {
				const url = 'http://my.url';
				const data = 'data';
				const mediaType = MediaType.GeoJSON;
				const instanceUnderTest = setup();
				const sourceTypeResult = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON));
				const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData').mockReturnValue(sourceTypeResult);
				const urlServiceSpy = vi.spyOn(urlService, 'proxifyInstant').mockReturnValue(url);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(
					new Response(data, {
						status: 200,
						headers: new Headers({
							'Content-Type': mediaType
						})
					})
				);
				vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
				const geoResourceFuture = instanceUnderTest.forUrl(url);

				const vgr = await geoResourceFuture.get();

				expect(vgr).toEqual(expect.any(VectorGeoResource));
				expect(vgr.sourceType).toEqual(VectorSourceType.GEOJSON);
				expect(vgr.id).toBe(geoResourceFuture.id);
				expect(vgr.data).toBe(data);
				expect(vgr.srid).toBe(4326);
				expect(vgr.getAttribution()).toEqual([getAttributionProviderForGeoResourceImportedByUrl(url)(vgr)]);
				expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
				expect(sourceTypeServiceSpy).toHaveBeenCalledWith(data);
				expect(urlServiceSpy).toHaveBeenCalledWith(url);
				expect(httpServiceSpy).toHaveBeenCalledWith(url);
			});

			it('loads EWKT data and returns a VectorGeoresource automatically setting id, sourceType and SRID', async () => {
				const url = 'http://my.url';
				const data = 'data';
				const dataSrid = 25832;
				const mediaType = MediaType.TEXT_PLAIN;
				const instanceUnderTest = setup();
				const sourceTypeResult = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.EWKT, null, dataSrid));
				const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData').mockReturnValue(sourceTypeResult);
				const urlServiceSpy = vi.spyOn(urlService, 'proxifyInstant').mockReturnValue(url);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(
					new Response(data, {
						status: 200,
						headers: new Headers({
							'Content-Type': mediaType
						})
					})
				);
				vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
				const geoResourceFuture = instanceUnderTest.forUrl(url);

				const vgr = await geoResourceFuture.get();

				expect(vgr).toEqual(expect.any(VectorGeoResource));
				expect(vgr.sourceType).toEqual(VectorSourceType.EWKT);
				expect(vgr.id).toBe(geoResourceFuture.id);
				expect(vgr.data).toBe(data);
				expect(vgr.srid).toBe(dataSrid);
				expect(vgr.getAttribution()).toEqual([getAttributionProviderForGeoResourceImportedByUrl(url)(vgr)]);
				expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
				expect(sourceTypeServiceSpy).toHaveBeenCalledWith(data);
				expect(urlServiceSpy).toHaveBeenCalledWith(url);
				expect(httpServiceSpy).toHaveBeenCalledWith(url);
			});

			it('throws an error when response is not ok', async () => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const id = 'id';
				const status = 404;
				const options = {
					id,
					label: 'label',
					sourceType: VectorSourceType.KML
				};
				const urlServiceSpy = vi.spyOn(urlService, 'proxifyInstant').mockReturnValue(url);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: status }));
				vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				await expect(geoResourceFuture.get()).rejects.toThrow(
					new UnavailableGeoResourceError(`GeoResource for '${url}' could not be loaded`, id, status)
				);
				expect(urlServiceSpy).toHaveBeenCalledWith(url);
				expect(httpServiceSpy).toHaveBeenCalledWith(url);
			});

			it('throws an error when sourceType is not available', async () => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const data = 'data';
				const id = 'id';
				const options = {
					id,
					label: 'label'
				};
				const sourceTypeServiceSpy = vi
					.spyOn(sourceTypeService, 'forData')
					.mockReturnValue(new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE));
				const urlServiceSpy = vi.spyOn(urlService, 'proxifyInstant').mockReturnValue(url);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(data, { status: 200 }));
				vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				await expect(geoResourceFuture.get()).rejects.toThrow(
					new UnavailableGeoResourceError(`GeoResource for '${url}' could not be loaded: SourceType could not be detected`, id)
				);
				expect(sourceTypeServiceSpy).toHaveBeenCalledWith(data);
				expect(urlServiceSpy).toHaveBeenCalledWith(url);
				expect(httpServiceSpy).toHaveBeenCalledWith(url);
			});

			it('returns NULL when source type is not supported', () => {
				const instanceUnderTest = setup();
				const url = 'http://my.url';
				const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
				const options = {
					id: 'id',
					sourceType: 'foo'
				};

				const geoResourceFuture = instanceUnderTest.forUrl(url, options);

				expect(geoResourceFuture).toBeNull();
				expect(warnSpy).toHaveBeenCalledWith(`SourceType '${options.sourceType}' for '${url}' is not supported`);
			});
		});
	});

	describe('_mapSourceTypeToVectorSourceType', () => {
		it('maps a SourceType to a VectorSourceType', () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest._mapSourceTypeToVectorSourceType()).toBeNull();
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.KML))).toBe(VectorSourceType.KML);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.GPX))).toBe(VectorSourceType.GPX);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.GEOJSON))).toBe(VectorSourceType.GEOJSON);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.EWKT))).toBe(VectorSourceType.EWKT);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(VectorSourceType.KML)).toBe(VectorSourceType.KML);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(VectorSourceType.GPX)).toBe(VectorSourceType.GPX);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(VectorSourceType.GEOJSON)).toBe(VectorSourceType.GEOJSON);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(VectorSourceType.EWKT)).toBe(VectorSourceType.EWKT);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType('foo'))).toBeNull();
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
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
			const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData');

			const vgr = instanceUnderTest.forData(data, options);

			expect(vgr.id).toBe(options.id);
			expect(vgr.label).toBe(options.label);
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(vgr.localData).toBe(false);
			expect(vgr.hidden).toBe(true);
			expect(vgr._attributionProvider).toBe(getAttributionForLocallyImportedOrCreatedGeoResource);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
			expect(sourceTypeServiceSpy).not.toHaveBeenCalled();
			expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
		});

		it('returns a VectorGeoResource for given VectorSourceType setting the `localData` flag', () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: VectorSourceType.KML
			};
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
			const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData');

			const vgr = instanceUnderTest.forData(data, options, true);

			expect(vgr.id).toBe(options.id);
			expect(vgr.label).toBe(options.label);
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(vgr.localData).toBe(true);
			expect(vgr.hidden).toBe(true);
			expect(vgr._attributionProvider).toBe(getAttributionForLocallyImportedOrCreatedGeoResource);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
			expect(sourceTypeServiceSpy).not.toHaveBeenCalled();
			expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
		});

		it('returns a VectorGeoResource for given SourceType', () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const options = {
				id: 'id',
				label: 'label',
				sourceType: new SourceType(SourceTypeName.KML)
			};
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
			const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData');

			const vgr = instanceUnderTest.forData(data, options);

			expect(vgr.id).toBe(options.id);
			expect(vgr.label).toBe(options.label);
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(vgr.localData).toBe(false);
			expect(vgr.hidden).toBe(true);
			expect(vgr._attributionProvider).toBe(getAttributionForLocallyImportedOrCreatedGeoResource);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
			expect(sourceTypeServiceSpy).not.toHaveBeenCalled();
			expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
		});

		it('returns a VectorGeoResource automatically setting id, sourceType and default SRID', () => {
			const data = 'data';
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
			const instanceUnderTest = setup();
			const sourceTypeResult = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON));
			const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData').mockReturnValue(sourceTypeResult);
			const mapSourceTypeToVectorSourceTypeSpy = vi.spyOn(instanceUnderTest, '_mapSourceTypeToVectorSourceType');

			const vgr = instanceUnderTest.forData(data);

			expect(vgr).toEqual(expect.any(VectorGeoResource));
			expect(vgr.sourceType).toEqual(VectorSourceType.GEOJSON);
			expect(vgr.id).toEqual(expect.any(String));
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(4326);
			expect(vgr.localData).toBe(false);
			expect(vgr.hidden).toBe(true);
			expect(vgr._attributionProvider).toBe(getAttributionForLocallyImportedOrCreatedGeoResource);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
			expect(mapSourceTypeToVectorSourceTypeSpy).toHaveBeenCalled();
			expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
			expect(sourceTypeServiceSpy).toHaveBeenCalledWith(data);
		});

		it('returns a VectorGeoResource automatically setting id, label and sourceType and SRID', () => {
			const data = 'data';
			const dataSrid = 25832;
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
			const instanceUnderTest = setup();
			const sourceTypeResult = new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.EWKT, null, dataSrid));
			const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData').mockReturnValue(sourceTypeResult);
			const mapSourceTypeToVectorSourceTypeSpy = vi.spyOn(instanceUnderTest, '_mapSourceTypeToVectorSourceType');

			const vgr = instanceUnderTest.forData(data);

			expect(vgr).toEqual(expect.any(VectorGeoResource));
			expect(vgr.sourceType).toEqual(VectorSourceType.EWKT);
			expect(vgr.id).toEqual(expect.any(String));
			expect(vgr.data).toBe(data);
			expect(vgr.srid).toBe(dataSrid);
			expect(vgr.localData).toBe(false);
			expect(vgr.hidden).toBe(true);
			expect(vgr._attributionProvider).toBe(getAttributionForLocallyImportedOrCreatedGeoResource);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(vgr);
			expect(mapSourceTypeToVectorSourceTypeSpy).toHaveBeenCalled();
			expect(vgr.marker).toBe(handledByGeoResourceServiceMarker);
			expect(sourceTypeServiceSpy).toHaveBeenCalledWith(data);
		});

		it('logs a warning and returns Null when sourceType is not supported', async () => {
			const instanceUnderTest = setup();
			const data = 'data';
			const sourceType = null;
			const sourceTypeResult = new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
			const sourceTypeServiceSpy = vi.spyOn(sourceTypeService, 'forData').mockReturnValue(sourceTypeResult);
			const mapSourceTypeToVectorSourceTypeSpy = vi.spyOn(instanceUnderTest, '_mapSourceTypeToVectorSourceType');
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace');
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const options = {
				id: 'id',
				sourceType: sourceType
			};

			const vgr = instanceUnderTest.forData(data, options);

			expect(vgr).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith(`SourceType for '${options.id}' could not be detected`);
			expect(geoResourceServiceSpy).not.toHaveBeenCalled();
			expect(mapSourceTypeToVectorSourceTypeSpy).toHaveBeenCalled();
			expect(sourceTypeServiceSpy).toHaveBeenCalledWith(data);
		});
	});

	describe('_newDefaultImportVectorDataOptions', () => {
		it('contains following properties', async () => {
			const instanceUnderTest = setup();
			expect(Object.keys(instanceUnderTest._newDefaultImportVectorDataOptions())).toHaveLength(3);
			expect(instanceUnderTest._newDefaultImportVectorDataOptions().id).toEqual(expect.any(String));
			expect(instanceUnderTest._newDefaultImportVectorDataOptions().label).toBeNull();
			expect(instanceUnderTest._newDefaultImportVectorDataOptions().sourceType).toBeNull();
		});
	});
});
