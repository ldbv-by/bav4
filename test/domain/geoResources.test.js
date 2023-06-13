/* eslint-disable no-undef */
import {
	GeoResourceTypes,
	GeoResource,
	WmsGeoResource,
	XyzGeoResource,
	VectorGeoResource,
	VectorSourceType,
	AggregateGeoResource,
	GeoResourceFuture,
	observable,
	GeoResourceAuthenticationType,
	VTGeoResource
} from '../../src/domain/geoResources';
import { $injector } from '../../src/injection';
import { getDefaultAttribution, getMinimalAttribution } from '../../src/services/provider/attribution.provider';
import { TestUtils } from '../test-utils';

describe('GeoResource', () => {
	const geoResourceServiceMock = {
		addOrReplace() {}
	};
	const httpServiceMock = {
		async get() {}
	};

	const setup = (state = {}) => {
		const store = TestUtils.setupStoreAndDi(state);
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock).registerSingleton('HttpService', httpServiceMock);
		return store;
	};

	const handledByGeoResourceServiceMarker = 'marker';
	const addOrReplaceMethodMock = (gr) => {
		gr.marker = handledByGeoResourceServiceMarker;
		return gr;
	};

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
			constructor(id, label) {
				super(id, label);
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
				expect(() => new GeoResourceNoImpl('some').getType()).toThrowError(
					TypeError,
					'Please implement abstract method #getType or do not call super.getType from child.'
				);
			});

			it('provides a check for containing a non-default value as label', () => {
				expect(new GeoResourceImpl('id').hasLabel()).toBeFalse();
				expect(new GeoResourceImpl('id', null).hasLabel()).toBeFalse();
				expect(new GeoResourceImpl('id', '').hasLabel()).toBeFalse();
				expect(new GeoResourceImpl('id', 'foo').hasLabel()).toBeTrue();
			});

			it('provides a check for detecting an imported GeoResource ', () => {
				expect(new GeoResourceImpl('id').isExternal()).toBeFalse();
				expect(new GeoResourceImpl('https://foo.bar', null).isExternal()).toBeTrue();
				expect(new GeoResourceImpl('https://foo.bar||some||thing', null).isExternal()).toBeTrue();
			});

			it('sets the attribution provider', () => {
				const provider = jasmine.createSpy();
				const grs = new GeoResourceImpl('id');
				grs.setAttributionProvider(provider);

				expect(grs.attributionProvider).toBe(provider);
			});

			it('returns an attribution provided by the provider', () => {
				const minimalAttribution = getMinimalAttribution();
				const spy = jasmine.createSpy().and.returnValue(minimalAttribution);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs.setAttributionProvider(spy);

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toEqual([minimalAttribution]);
			});

			it('returns an attribution when provider returns an array', () => {
				const minimalAttribution = getMinimalAttribution();
				const spy = jasmine.createSpy().and.returnValue([minimalAttribution]);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs.setAttributionProvider(spy);

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toEqual([minimalAttribution]);
			});

			it('returns null when provider returns null', () => {
				const spy = jasmine.createSpy().and.returnValue(null);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs.setAttributionProvider(spy);

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toBeNull();
			});

			it('returns null when provider returns an empty array', () => {
				const spy = jasmine.createSpy().and.returnValue([]);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs.setAttributionProvider(spy);

				const result = grs.getAttribution(42);

				expect(spy).toHaveBeenCalledWith(grs, 42);
				expect(result).toBeNull();
			});

			it('throws an error when no provider found', () => {
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs.setAttributionProvider(null);

				expect(() => {
					grs.getAttribution(42);
				}).toThrowError('No attribution provider found');
			});

			it('copies the properties from another GeoResource', () => {
				const attributionProvider = () => {};
				const geoResource0 = new GeoResourceNoImpl('id0');
				geoResource0
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setHidden(true)
					.setLabel('some label')
					.setAttribution('some attribution')
					.setAttributionProvider(attributionProvider)
					.setAuthenticationType(GeoResourceAuthenticationType.BAA)
					.setQueryable(false)
					.setExportable(false);
				const geoResource1 = new GeoResourceNoImpl('id1');

				geoResource1.copyPropertiesFrom(geoResource0);

				expect(geoResource1.hidden).toBeTrue();
				expect(geoResource1.opacity).toBe(0.5);
				expect(geoResource1.minZoom).toBe(5);
				expect(geoResource1.maxZoom).toBe(19);
				expect(geoResource1.label).toBe('some label');
				expect(geoResource1.attribution).toBe('some attribution');
				expect(geoResource1.authenticationType).toEqual(GeoResourceAuthenticationType.BAA);
				expect(geoResource1.attributionProvider).toEqual(attributionProvider);
				expect(geoResource1.queryable).toBeFalse();
				expect(geoResource1.exportable).toBeFalse();
			});
		});

		describe('properties', () => {
			it('provides default properties', () => {
				setup();
				const georesource = new GeoResourceNoImpl('id');

				expect(georesource.label).toBeNull();
				expect(georesource.opacity).toBe(1);
				expect(georesource.minZoom).toBeNull();
				expect(georesource.maxZoom).toBeNull();
				expect(georesource.hidden).toBeFalse();
				expect(georesource.attribution).toBeNull();
				expect(georesource.authenticationType).toBeNull();
				expect(georesource.attributionProvider).toBe(getDefaultAttribution);
				expect(georesource.queryable).toBeTrue();
				expect(georesource.exportable).toBeTrue();
			});

			it('provides set methods and getters', () => {
				setup();
				const georesource = new GeoResourceNoImpl('id');

				georesource
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setHidden(true)
					.setLabel('some label')
					.setAttribution('some attribution')
					.setAuthenticationType(GeoResourceAuthenticationType.BAA)
					.setQueryable(false)
					.setExportable(false);

				expect(georesource.hidden).toBeTrue();
				expect(georesource.opacity).toBe(0.5);
				expect(georesource.minZoom).toBe(5);
				expect(georesource.maxZoom).toBe(19);
				expect(georesource.label).toBe('some label');
				expect(georesource.attribution).toBe('some attribution');
				expect(georesource.authenticationType).toEqual(GeoResourceAuthenticationType.BAA);
				expect(georesource.queryable).toBeFalse();
				expect(georesource.exportable).toBeFalse();
			});
		});
	});

	describe('GeoResourceFuture', () => {
		it('instantiates a GeoResourceFuture', () => {
			setup();
			const loader = async () => {};

			const future = new GeoResourceFuture('id', loader);

			expect(future.getType()).toEqual(GeoResourceTypes.FUTURE);
			expect(future._loader).toBe(loader);
			expect(future.label).toBeNull();
		});

		it('instantiates a GeoResourceFuture with optional label', () => {
			setup();
			const loader = async () => {};

			const future = new GeoResourceFuture('id', loader, 'label');

			expect(future.getType()).toEqual(GeoResourceTypes.FUTURE);
			expect(future._loader).toBe(loader);
			expect(future.label).toBe('label');
		});

		it('registers and returns the real GeoResource by calling loader', async () => {
			setup();
			const id = 'id';
			const expectedGeoResource = new WmsGeoResource(id, 'label', 'url', 'layers', 'format');
			const loader = jasmine.createSpy().withArgs(id).and.resolveTo(expectedGeoResource);
			const future = new GeoResourceFuture(id, loader);
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'addOrReplace').withArgs(expectedGeoResource).and.callFake(addOrReplaceMethodMock);

			const geoResource = await future.get();

			expect(geoResource).toEqual(expectedGeoResource);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResource);
			expect(geoResource.marker).toBe(handledByGeoResourceServiceMarker);
		});

		it('rejects when the loader rejects', async () => {
			setup();
			const id = 'id';
			const message = 'error';
			const loader = jasmine.createSpy().withArgs(id).and.rejectWith(message);
			const future = new GeoResourceFuture(id, loader);

			try {
				await future.get();
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error).toBe(message);
			}
		});

		it('calls the onResolve callback', async () => {
			setup();
			const id = 'id';
			const expectedGeoResource = new WmsGeoResource(id, 'label', 'url', 'layers', 'format');
			spyOn(geoResourceServiceMock, 'addOrReplace').withArgs(expectedGeoResource).and.returnValue(expectedGeoResource);
			const loader = jasmine.createSpy().withArgs(id).and.resolveTo(expectedGeoResource);
			const onResolveCallback = jasmine.createSpy();
			const future = new GeoResourceFuture(id, loader).onResolve(onResolveCallback);

			await future.get();

			expect(onResolveCallback).toHaveBeenCalledWith(expectedGeoResource, future);
		});

		it('calls the onReject callback', async () => {
			setup();
			const id = 'id';
			const loader = jasmine.createSpy().withArgs(id).and.rejectWith('error');
			const onResolveCallback = jasmine.createSpy();
			const future = new GeoResourceFuture(id, loader).onReject(onResolveCallback);

			try {
				await future.get();
				throw new Error('Promise should not be resolved');
			} catch (error) {
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
			const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format').setExtraParams({ foo: 'bar' });

			expect(wmsGeoResource.extraParams).toEqual({ foo: 'bar' });
		});
	});

	describe('XyzGeoResource', () => {
		it('instantiates a XyzGeoResource', () => {
			const xyzGeoResource = new XyzGeoResource('id', 'label', 'url');

			expect(xyzGeoResource.getType()).toEqual(GeoResourceTypes.XYZ);
			expect(xyzGeoResource.id).toBe('id');
			expect(xyzGeoResource.label).toBe('label');
			expect(xyzGeoResource.urls).toBe('url');
		});

		it('provides default properties', () => {
			const xyzGeoResource = new XyzGeoResource('id', 'label', 'url');

			expect(xyzGeoResource.tileGridId).toBeNull();
		});

		it('provides set methods and getters', () => {
			const xyzGeoResource = new XyzGeoResource('id', 'label', 'url').setTileGridId('tileGridId');

			expect(xyzGeoResource.tileGridId).toBe('tileGridId');
		});
	});

	it('provides an enum of all available vector source types', () => {
		expect(Object.keys(VectorSourceType).length).toBe(4);
		expect(VectorSourceType.KML).toBeTruthy();
		expect(VectorSourceType.GPX).toBeTruthy();
		expect(VectorSourceType.GEOJSON).toBeTruthy();
		expect(VectorSourceType.EWKT).toBeTruthy();
	});

	describe('VectorGeoResource', () => {
		it('instantiates a VectorGeoResource', () => {
			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML);

			expect(vectorGeoResource.getType()).toEqual(GeoResourceTypes.VECTOR);
			expect(vectorGeoResource.id).toBe('id');
			expect(vectorGeoResource.label).toBe('label');
			expect(vectorGeoResource.srid).toBeNull();
			expect(vectorGeoResource.sourceType).toEqual(VectorSourceType.KML);
			expect(vectorGeoResource.data).toBeNull();
		});

		it('provides default properties', () => {
			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML);

			expect(vectorGeoResource.clusterParams).toEqual({});
		});

		it('provides the source type as fallback label', () => {
			expect(new VectorGeoResource('id', 'foo', VectorSourceType.KML).label).toBe('foo');
			expect(new VectorGeoResource('id', null, VectorSourceType.KML).label).toBe('KML');
			expect(new VectorGeoResource('id', null, VectorSourceType.GPX).label).toBe('GPX');
			expect(new VectorGeoResource('id', null, VectorSourceType.GEOJSON).label).toBe('GeoJSON');
			expect(new VectorGeoResource('id', null, VectorSourceType.EWKT).label).toBe('EWKT');
			expect(new VectorGeoResource('id', null, 'unknown').label).toBe('');
		});

		it('sets the source of an internal VectorGeoResource by a string', () => {
			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource('someData', 1234);

			expect(vectorGeoResource.data).toBe('someData');
			expect(vectorGeoResource.srid).toBe(1234);
		});

		describe('methods', () => {
			it('provides a check for containing a non-default value as clusterParam', () => {
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).isClustered()).toBeFalse();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).setClusterParams({ foo: 'bar' }).isClustered()).toBeTrue();
			});

			it('provides a check for containing a non-default value as label', () => {
				expect(new VectorGeoResource('id', null, VectorSourceType.KML).hasLabel()).toBeFalse();
				expect(new VectorGeoResource('id', '', VectorSourceType.KML).hasLabel()).toBeFalse();
				expect(new VectorGeoResource('id', 'foo', VectorSourceType.KML).hasLabel()).toBeTrue();
			});

			it('provides a static method for creating a VectorGeoResource from an URL', async () => {
				setup();
				const url = 'url';
				const data = 'data';
				spyOn(httpServiceMock, 'get')
					.withArgs(url, { timeout: 5000 })
					.and.returnValue(Promise.resolve(new Response(data, { status: 200 })));
				spyOn(geoResourceServiceMock, 'addOrReplace').and.callFake((gr) => gr);

				const geoResourceFuture = VectorGeoResource.forUrl('id', 'url', VectorSourceType.KML);

				expect(geoResourceFuture.id).toBe('id');
				expect(geoResourceFuture.label).toBeNull();
				expect(geoResourceFuture).toBeInstanceOf(GeoResourceFuture);
				const vectorGeoResource = await geoResourceFuture.get();
				expect(vectorGeoResource.id).toBe('id');
				expect(vectorGeoResource.data).toBe(data);
				expect(vectorGeoResource.label).not.toBeNull();
			});

			it('provides a static method for creating a VectorGeoResource from an URL with optional property "label"', async () => {
				setup();
				const url = 'url';
				const label = 'label';
				const data = 'data';
				spyOn(httpServiceMock, 'get')
					.withArgs(url, { timeout: 5000 })
					.and.returnValue(Promise.resolve(new Response(data, { status: 200 })));
				spyOn(geoResourceServiceMock, 'addOrReplace').and.callFake((gr) => gr);

				const geoResourceFuture = VectorGeoResource.forUrl('id', 'url', VectorSourceType.KML, label);

				expect(geoResourceFuture.id).toBe('id');
				expect(geoResourceFuture.label).toBe(label);
				expect(geoResourceFuture).toBeInstanceOf(GeoResourceFuture);
				const vectorGeoResource = await geoResourceFuture.get();
				expect(vectorGeoResource.id).toBe('id');
				expect(vectorGeoResource.label).toBe(label);
				expect(vectorGeoResource.data).toBe(data);
			});
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
			setup();
			const modifiedLabel = 'modified';
			const callback = jasmine.createSpy();
			const xyzGeoResource = observable(new XyzGeoResource('xyzId', 'label', 'url'), callback);

			xyzGeoResource.setLabel(modifiedLabel);
			xyzGeoResource.setLabel(modifiedLabel);
			xyzGeoResource.unknown = modifiedLabel;

			expect(callback).toHaveBeenCalledOnceWith('_label', modifiedLabel);
			expect(xyzGeoResource.label).toBe(modifiedLabel);
		});

		it('observes changes and registers an identifier', () => {
			setup();
			const identifier = '__foo';
			const modifiedLabel = 'modified';
			const callback = jasmine.createSpy();
			const xyzGeoResource = observable(new XyzGeoResource('xyzId', 'label', 'url'), callback, identifier);

			xyzGeoResource.setLabel(modifiedLabel);
			xyzGeoResource.setLabel(modifiedLabel);
			xyzGeoResource.unknown = modifiedLabel;

			expect(callback).toHaveBeenCalledOnceWith('_label', modifiedLabel);
			expect(xyzGeoResource.label).toBe(modifiedLabel);
			expect(xyzGeoResource[identifier]).toBeTrue();
		});
	});
});
