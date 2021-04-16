/* eslint-disable no-undef */
import { GeoResourceTypes, GeoResource, WmsGeoResource, WMTSGeoResource, VectorGeoResource, VectorSourceType, AggregateGeoResource } from '../../../src/services/domain/geoResources';


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
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new GeoResource()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws excepetion when instantiated without id', () => {
				expect(() => new GeoResourceNoImpl()).toThrowError(TypeError, 'id must not be undefined');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #getType is called without overriding', () => {
				expect(() => new GeoResourceNoImpl('some').getType()).toThrowError(TypeError, 'Please implement abstract method #getType or do not call super.getType from child.');
			});

			describe('attribution', () => {

				const getMinimalAttribution = (copyrightLabel) => {
					return {
						copyright: {
							label: copyrightLabel
						}
					};

				};
				const fooAttribution = getMinimalAttribution('foo');
				const barAttribution = getMinimalAttribution('bar');

				it('sets the attribution', () => {
					expect(new GeoResourceImpl('some').setAttribution(fooAttribution)._attribution).toBe(fooAttribution);
				});


				it('returns an optionally index-based attribution', () => {
					class GeoResourceAttrImpl extends GeoResource {
						constructor(attribution) {
							super('id');
							this._attribution = attribution;
						}
					}

					expect(new GeoResourceAttrImpl(null).getAttribution()).toBeNull;
					expect(new GeoResourceAttrImpl(undefined).getAttribution()).toBeNull();
					expect(new GeoResourceAttrImpl(fooAttribution).getAttribution()).toEqual(fooAttribution);
					expect(new GeoResourceAttrImpl([fooAttribution, barAttribution]).getAttribution()).toEqual(fooAttribution);
					expect(new GeoResourceAttrImpl([fooAttribution, barAttribution]).getAttribution(1)).toEqual(barAttribution);
					expect(new GeoResourceAttrImpl([fooAttribution, barAttribution]).getAttribution(2)).toBeNull();
					expect(new GeoResourceAttrImpl([fooAttribution, barAttribution]).getAttribution(0.49)).toEqual(fooAttribution);
				});
			});
		});

		describe('properties', () => {
			it('provides default properties', () => {
				const georesource = new GeoResourceNoImpl('id');

				expect(georesource.label).toBe('');
				expect(georesource.background).toBeFalse();
				expect(georesource.opacity).toBe(1);
			});

			it('provides setter for properties', () => {
				const georesource = new GeoResourceNoImpl('id');

				georesource.opacity = .5;
				georesource.background = true;
				georesource.label = 'some label';

				expect(georesource.background).toBeTrue();
				expect(georesource.opacity).toBe(.5);
				expect(georesource.label).toBe('some label');
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

		it('passes the reason of a rejected source promise', (done) => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource(Promise.reject('somethingGotWrong'), 1234);

			vectorGeoResource.getData().then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason).toBe('somethingGotWrong');
				done();
			});
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

		it('passes the reason of a rejected loader', (done) => {
			
			const vectorGeoResource = new VectorGeoResource('id', 'label', null)
				.setLoader(() => Promise.reject('somethingGotWrong'));

			vectorGeoResource.getData().then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason).toBe('somethingGotWrong');
				done();
			});
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