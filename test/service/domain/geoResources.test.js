/* eslint-disable no-undef */
import { GeoResourceTypes, GeoResource, WmsGeoResource, WMTSGeoResource, VectorGeoResource, VectorSourceType, AggregateGeoResource } from '../../../src/services/domain/geoResources';
import { getDefaultAttribution, getMinimalAttribution } from '../../../src/services/provider/attribution.provider';


describe('GeoResource', () => {

	describe('GeoResourceTypes', () => {

		it('provides an enum of all available types', () => {

			expect(GeoResourceTypes.WMS).toBeTruthy();
			expect(GeoResourceTypes.WMTS).toBeTruthy();
			expect(GeoResourceTypes.VECTOR).toBeTruthy();
			expect(GeoResourceTypes.VECTOR_TILES).toBeTruthy();
			expect(GeoResourceTypes.AGGREGATE).toBeTruthy();
		});
	});

	describe('abstract GeoResource', () => {

		class GeoResourceNoImpl extends GeoResource {
			constructor(id) {
				super(id);
			}
		}

		class GeoResourceImpl extends GeoResource {
			constructor(id) {
				super(id);
			}
		}

		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new GeoResource()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws exception when instantiated without id', () => {
				expect(() => new GeoResourceNoImpl()).toThrowError(TypeError, 'id must not be undefined');
			});
		});

		describe('methods', () => {

			it('throws exception when abstract #getType is called without overriding', () => {
				expect(() => new GeoResourceNoImpl('some').getType()).toThrowError(TypeError, 'Please implement abstract method #getType or do not call super.getType from child.');
			});

			it('sets the attribution provider', () => {

				const provider = jasmine.createSpy();
				const grs = new GeoResourceImpl('id');
				grs.setAttributionProvider(provider);

				expect(grs._attributionProvider).toBe(provider);
			});

			it('returns an attribution provided by the provider', () => {
				const minimalAttribution = getMinimalAttribution();
				const spy = jasmine.createSpy().and.returnValue(minimalAttribution);
				const grs = new GeoResourceImpl('id');
				grs.attribution = 'foo';
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toEqual([minimalAttribution]);
			});

			it('returns an attribution when provider returns an array', () => {
				const minimalAttribution = getMinimalAttribution();
				const spy = jasmine.createSpy().and.returnValue([minimalAttribution]);
				const grs = new GeoResourceImpl('id');
				grs.attribution = 'foo';
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toEqual([minimalAttribution]);
			});

			it('returns null when provider returns null', () => {
				const spy = jasmine.createSpy().and.returnValue(null);
				const grs = new GeoResourceImpl('id');
				grs.attribution = 'foo';
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toBeNull();
			});

			it('returns null when provider returns an empyt array', () => {
				const spy = jasmine.createSpy().and.returnValue([]);
				const grs = new GeoResourceImpl('id');
				grs.attribution = 'foo';
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toBeNull();
			});

			it('throws an error when no provider found', () => {
				const grs = new GeoResourceImpl('id');
				grs.attribution = 'foo';
				grs._attributionProvider = null;

				expect(() => {
					grs.getAttribution(42);
				}).toThrowError('No attribution provider found');
			});
		});

		describe('properties', () => {
			it('provides default properties', () => {
				const georesource = new GeoResourceNoImpl('id');

				expect(georesource.label).toBe('');
				expect(georesource.background).toBeFalse();
				expect(georesource.opacity).toBe(1);
				expect(georesource.attribution).toBeNull();
				expect(georesource._attributionProvider).toBe(getDefaultAttribution);
			});

			it('provides setter and getters', () => {
				const georesource = new GeoResourceNoImpl('id');

				georesource.opacity = .5;
				georesource.background = true;
				georesource.label = 'some label';
				georesource.label = 'some label';
				georesource.attribution = 'some attribution';

				expect(georesource.background).toBeTrue();
				expect(georesource.opacity).toBe(.5);
				expect(georesource.label).toBe('some label');
				expect(georesource.attribution).toBe('some attribution');
			});
		});

	});

	describe('WmsGeoResource', () => {

		it('instantiates a WmsGeoResource', () => {

			const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format');

			expect(wmsGeoResource.getType()).toEqual(GeoResourceTypes.WMS);
			expect(wmsGeoResource.id).toBe('id');
			expect(wmsGeoResource.label).toBe('label');
			expect(wmsGeoResource.url).toBe('url');
			expect(wmsGeoResource.layers).toBe('layers');
			expect(wmsGeoResource.format).toBe('format');
		});
	});

	describe('WmtsGeoResource', () => {

		it('instantiates a WmtsGeoResource', () => {

			const wmtsGeoResource = new WMTSGeoResource('id', 'label', 'url');

			expect(wmtsGeoResource.getType()).toEqual(GeoResourceTypes.WMTS);
			expect(wmtsGeoResource.id).toBe('id');
			expect(wmtsGeoResource.label).toBe('label');
			expect(wmtsGeoResource.url).toBe('url');
		});
	});

	it('provides an enum of all available vector source types', () => {

		expect(Object.keys(VectorSourceType).length).toBe(3);
		expect(VectorSourceType.KML).toBeTruthy();
		expect(VectorSourceType.GPX).toBeTruthy();
		expect(VectorSourceType.GEOJSON).toBeTruthy();
	});


	describe('VectorGeoResource', () => {

		it('instantiates a VectorGeoResource', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML);

			expect(vectorGeoResource.getType()).toEqual(GeoResourceTypes.VECTOR);
			expect(vectorGeoResource.id).toBe('id');
			expect(vectorGeoResource.label).toBe('label');
			expect(vectorGeoResource.url).toBeNull();
			expect(vectorGeoResource.srid).toBeNull();
			expect(vectorGeoResource.sourceType).toEqual(VectorSourceType.KML);
			const data = await vectorGeoResource.getData();
			expect(data).toBeNull();
		});

		it('sets the url of an external VectorGeoResource', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setUrl('someUrl');

			expect(vectorGeoResource.url).toBe('someUrl');
			expect(vectorGeoResource.srid).toBeNull();
			const data = await vectorGeoResource.getData();
			expect(data).toBeNull();
		});

		it('sets the source of an internal VectorGeoResource by a string', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource('someData', 1234);

			const data = await vectorGeoResource.getData();
			expect(data).toBe('someData');
			expect(vectorGeoResource.srid).toBe(1234);
			expect(vectorGeoResource.url).toBeNull();
		});

		it('sets the source of an internal VectorGeoResource by a promise', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource(Promise.resolve('someData'), 1234);

			const data = await vectorGeoResource.getData();
			expect(data).toBe('someData');
			expect(vectorGeoResource.srid).toBe(1234);
			expect(vectorGeoResource.url).toBeNull();
		});

		it('caches the data resolved by a source promise', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource(Promise.resolve('someData'), 1234);

			await vectorGeoResource.getData();
			expect(vectorGeoResource._data).toBe('someData');
		});

		it('passes the reason of a rejected source promise', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource(Promise.reject('somethingGotWrong'), 1234);

			try {
				await vectorGeoResource.getData();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error).toBe('somethingGotWrong');
			}
		});

		it('sets the source of an internal VectorGeoResource by a loader', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', null)
				.setLoader(() => Promise.resolve({
					data: 'someData',
					srid: 1234,
					sourceType: VectorSourceType.KML
				}));

			const data = await vectorGeoResource.getData();
			expect(data).toBe('someData');
			expect(vectorGeoResource.srid).toBe(1234);
			expect(vectorGeoResource.sourceType).toEqual(VectorSourceType.KML);
			expect(vectorGeoResource.url).toBeNull();
		});

		it('caches the data resolved by a loader', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', null)
				.setLoader(() => Promise.resolve({
					data: 'someData',
					srid: 1234,
					sourceType: VectorSourceType.KML
				}));

			await vectorGeoResource.getData();
			expect(vectorGeoResource._data).toBe('someData');
		});

		it('passes the reason of a rejected loader', async () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', null)
				.setLoader(() => Promise.reject('somethingGotWrong'));

			try {
				await vectorGeoResource.getData();
				throw new Error('Promise should not be resolved');

			}
			catch (error) {
				expect(error).toBe('somethingGotWrong');
			}
		});
	});

	describe('AggregateResource', () => {

		it('instantiates a AggregateResource', () => {

			const wmsGeoResource = new WmsGeoResource('wmsId', 'label', 'url', 'layers', 'format');
			const wmtsGeoResource = new WMTSGeoResource('wmtsId', 'label', 'url');

			const aggregateGeoResource = new AggregateGeoResource('id', 'label', [wmsGeoResource, wmtsGeoResource]);

			expect(aggregateGeoResource.getType()).toEqual(GeoResourceTypes.AGGREGATE);
			expect(aggregateGeoResource.geoResourceIds.length).toBe(2);
			expect(aggregateGeoResource.geoResourceIds[0].id).toBe('wmsId');
			expect(aggregateGeoResource.geoResourceIds[1].id).toBe('wmtsId');
		});

	});
});
