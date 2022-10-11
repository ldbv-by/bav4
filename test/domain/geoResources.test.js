/* eslint-disable no-undef */
import { GeoResourceTypes, GeoResource, WmsGeoResource, XyzGeoResource, VectorGeoResource, VectorSourceType, AggregateGeoResource, GeoResourceFuture, observable, GeoResourceAuthenticationType, VTGeoResource } from '../../src/domain/geoResources';
import { getDefaultAttribution, getMinimalAttribution } from '../../src/services/provider/attribution.provider';


describe('GeoResource', () => {

	describe('GeoResourceTypes', () => {

		it('provides an enum of all available types', () => {

			expect(GeoResourceTypes.WMS.description).toBe('wms');
			expect(GeoResourceTypes.XYZ.description).toBe('xyz');
			expect(GeoResourceTypes.VECTOR.description).toBe('vector');
			expect(GeoResourceTypes.VT.description).toBe('vt');
			expect(GeoResourceTypes.AGGREGATE.description).toBe('aggregate');
			expect(GeoResourceTypes.FUTURE.description).toBe('future');
		});
	});

	describe('GeoResourceAuthenticationType', () => {

		it('provides an enum of all available types', () => {

			expect(GeoResourceAuthenticationType.BAA).toBe('baa');
			expect(GeoResourceAuthenticationType.PLUS).toBe('plus');
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
				grs.setAttribution('foo');
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toEqual([minimalAttribution]);
			});

			it('returns an attribution when provider returns an array', () => {
				const minimalAttribution = getMinimalAttribution();
				const spy = jasmine.createSpy().and.returnValue([minimalAttribution]);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toEqual([minimalAttribution]);
			});

			it('returns null when provider returns null', () => {
				const spy = jasmine.createSpy().and.returnValue(null);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toBeNull();
			});

			it('returns null when provider returns an empyt array', () => {
				const spy = jasmine.createSpy().and.returnValue([]);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs._attributionProvider = spy;

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toBeNull();
			});

			it('throws an error when no provider found', () => {
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
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
				expect(georesource.opacity).toBe(1);
				expect(georesource.minZoom).toBeNull();
				expect(georesource.maxZoom).toBeNull();
				expect(georesource.hidden).toBeFalse();
				expect(georesource.attribution).toBeNull();
				expect(georesource.authenticationType).toBeNull();
				expect(georesource.importedByUser).toBeFalse();
				expect(georesource._attributionProvider).toBe(getDefaultAttribution);
				expect(georesource._queryable).toBeTrue();
				expect(georesource._exportable).toBeTrue();
			});

			it('provides set methods and getters', () => {
				const georesource = new GeoResourceNoImpl('id');

				georesource
					.setOpacity(.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setHidden(true)
					.setLabel('some label')
					.setAttribution('some attribution')
					.setAuthenticationType(GeoResourceAuthenticationType.BAA)
					.setImportedByUser(true)
					.setQueryable(false)
					.setExportable(false);


				expect(georesource.hidden).toBeTrue();
				expect(georesource.opacity).toBe(.5);
				expect(georesource.minZoom).toBe(5);
				expect(georesource.maxZoom).toBe(19);
				expect(georesource.label).toBe('some label');
				expect(georesource.attribution).toBe('some attribution');
				expect(georesource.authenticationType).toEqual(GeoResourceAuthenticationType.BAA);
				expect(georesource.importedByUser).toBeTrue();
				expect(georesource.queryable).toBeFalse();
				expect(georesource.exportable).toBeFalse();
			});
		});

	});

	describe('GeoResourceFuture', () => {

		it('instantiates a GeoResourceFuture', () => {
			const loader = async () => { };

			const future = new GeoResourceFuture('id', loader, 'label');
			const futureWithoutLabel = new GeoResourceFuture('id', loader);

			expect(future.getType()).toEqual(GeoResourceTypes.FUTURE);
			expect(future._loader).toBe(loader);
			expect(future.label).toBe('label');
			expect(futureWithoutLabel.label).toHaveSize(0);
		});

		it('returns the real GeoResource by calling loader', async () => {
			const id = 'id';
			const expectedGeoResource = new WmsGeoResource(id, 'label', 'url', 'layers', 'format');
			const loader = jasmine.createSpy().withArgs(id).and.resolveTo(expectedGeoResource);
			const future = new GeoResourceFuture(id, loader);

			const geoResource = await future.get();

			expect(geoResource).toEqual(expectedGeoResource);
		});

		it('rejects when the loader rejects', async () => {
			const id = 'id';
			const message = 'error';
			const loader = jasmine.createSpy().withArgs(id).and.rejectWith(message);
			const future = new GeoResourceFuture(id, loader);

			try {
				await future.get();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error).toBe(message);
			}
		});

		it('calls the onResolve callback', async () => {
			const id = 'id';
			const expectedGeoResource = new WmsGeoResource(id, 'label', 'url', 'layers', 'format');
			const loader = jasmine.createSpy().withArgs(id).and.resolveTo(expectedGeoResource);
			const onResolveCallback = jasmine.createSpy();
			const future = new GeoResourceFuture(id, loader);
			future.onResolve(onResolveCallback);

			await future.get();

			expect(onResolveCallback).toHaveBeenCalledWith(expectedGeoResource, future);
		});

		it('calls the onReject callback', async () => {
			const id = 'id';
			const loader = jasmine.createSpy().withArgs(id).and.rejectWith('error');
			const onResolveCallback = jasmine.createSpy();
			const future = new GeoResourceFuture(id, loader);
			future.onReject(onResolveCallback);

			try {
				await future.get();
				throw new Error('Promise should not be resolved');

			}
			catch (error) {
				expect(onResolveCallback).toHaveBeenCalledWith(future);
			}
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

		it('provides default properties', () => {
			const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format');

			expect(wmsGeoResource.extraParams).toEqual({});
		});

		it('provides set methods and getters', () => {
			const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format')
				.setExtraParams({ 'foo': 'bar' });

			expect(wmsGeoResource.extraParams).toEqual({ 'foo': 'bar' });
		});
	});

	describe('XyzGeoResource', () => {

		it('instantiates a XyzGeoResource', () => {

			const xyzGeoResource = new XyzGeoResource('id', 'label', 'url');

			expect(xyzGeoResource.getType()).toEqual(GeoResourceTypes.XYZ);
			expect(xyzGeoResource.id).toBe('id');
			expect(xyzGeoResource.label).toBe('label');
			expect(xyzGeoResource.url).toBe('url');
		});

		it('provides default properties', () => {
			const xyzGeoResource = new XyzGeoResource('id', 'label', 'url');

			expect(xyzGeoResource.tileGridId).toBeNull();
		});

		it('provides set methods and getters', () => {
			const xyzGeoResource = new XyzGeoResource('id', 'label', 'url')
				.setTileGridId('tileGridId');

			expect(xyzGeoResource.tileGridId).toBe('tileGridId');
		});
	});

	it('provides an enum of all available vector source types', () => {

		expect(Object.keys(VectorSourceType).length).toBe(3);
		expect(VectorSourceType.KML).toBeTruthy();
		expect(VectorSourceType.GPX).toBeTruthy();
		expect(VectorSourceType.GEOJSON).toBeTruthy();
	});


	describe('VectorGeoResource', () => {

		it('instantiates a VectorGeoResource', () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML);

			expect(vectorGeoResource.getType()).toEqual(GeoResourceTypes.VECTOR);
			expect(vectorGeoResource.id).toBe('id');
			expect(vectorGeoResource.label).toBe('label');
			expect(vectorGeoResource.url).toBeNull();
			expect(vectorGeoResource.srid).toBeNull();
			expect(vectorGeoResource.sourceType).toEqual(VectorSourceType.KML);
			expect(vectorGeoResource.data).toBeNull();
		});

		it('sets the url of an external VectorGeoResource', () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setUrl('someUrl');

			expect(vectorGeoResource.url).toBe('someUrl');
			expect(vectorGeoResource.srid).toBeNull();
			expect(vectorGeoResource.data).toBeNull();
		});

		it('sets the source of an internal VectorGeoResource by a string', () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource('someData', 1234);

			expect(vectorGeoResource.data).toBe('someData');
			expect(vectorGeoResource.srid).toBe(1234);
			expect(vectorGeoResource.url).toBeNull();
		});
	});

	describe('AggregateGeoResource', () => {

		it('instantiates a AggregateResource', () => {

			const wmsGeoResource = new WmsGeoResource('wmsId', 'label', 'url', 'layers', 'format');
			const xyzGeoResource = new XyzGeoResource('xyzId', 'label', 'url');

			const aggregateGeoResource = new AggregateGeoResource('id', 'label', [wmsGeoResource, xyzGeoResource]);

			expect(aggregateGeoResource.getType()).toEqual(GeoResourceTypes.AGGREGATE);
			expect(aggregateGeoResource.geoResourceIds.length).toBe(2);
			expect(aggregateGeoResource.geoResourceIds[0].id).toBe('wmsId');
			expect(aggregateGeoResource.geoResourceIds[1].id).toBe('xyzId');
		});

	});

	describe('VTGeoResource', () => {

		it('instantiates a VTGeoResource', () => {

			const vectorGeoResource = new VTGeoResource('id', 'label', 'styleUrl');

			expect(vectorGeoResource.getType()).toEqual(GeoResourceTypes.VT);
			expect(vectorGeoResource.id).toBe('id');
			expect(vectorGeoResource.label).toBe('label');
			expect(vectorGeoResource.styleUrl).toBe('styleUrl');
		});

	});

	describe('observableGeoResource', () => {

		it('observes changes', () => {

			const modifiedLabel = 'modified';
			const callback = jasmine.createSpy();
			const xyzGeoResource = observable(new XyzGeoResource('xyzId', 'label', 'url'), callback);

			xyzGeoResource.setLabel(modifiedLabel);
			xyzGeoResource.setLabel(modifiedLabel);
			xyzGeoResource.unknown = modifiedLabel;

			expect(callback).toHaveBeenCalledOnceWith('_label', modifiedLabel);
			expect(xyzGeoResource.label).toBe(modifiedLabel);
		});
	});
});
