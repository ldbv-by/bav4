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
	VTGeoResource,
	RtVectorGeoResource,
	OafGeoResource,
	AbstractVectorGeoResource,
	FEATURE_COLLECTION_GEORESOURCE_ID
} from '../../src/domain/geoResources';
import { $injector } from '../../src/injection';
import { getDefaultAttribution, getMinimalAttribution } from '../../src/services/provider/attribution.provider';
import { TestUtils } from '../test-utils';
import { StyleHint } from '../../src/domain/styles';
import { BaFeature } from '../../src/domain/feature';
import { BaGeometry } from '../../src/domain/geometry';
import { SourceType } from '../../src/domain/sourceType';

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

	describe('constants', () => {
		it('exports constant values', () => {
			expect(FEATURE_COLLECTION_GEORESOURCE_ID).toBe('feature_collection');
		});
	});

	describe('GeoResourceTypes', () => {
		it('provides an enum of all available types', () => {
			expect(Object.entries(GeoResourceTypes).length).toBe(8);
			expect(Object.isFrozen(GeoResourceTypes)).toBeTrue();
			expect(GeoResourceTypes.WMS.description).toBe('wms');
			expect(GeoResourceTypes.XYZ.description).toBe('xyz');
			expect(GeoResourceTypes.VECTOR.description).toBe('vector');
			expect(GeoResourceTypes.RT_VECTOR.description).toBe('rtvector');
			expect(GeoResourceTypes.OAF.description).toBe('oaf');
			expect(GeoResourceTypes.VT.description).toBe('vt');
			expect(GeoResourceTypes.AGGREGATE.description).toBe('aggregate');
			expect(GeoResourceTypes.FUTURE.description).toBe('future');
		});
	});

	describe('GeoResourceAuthenticationType', () => {
		it('provides an enum of all available types', () => {
			expect(Object.entries(GeoResourceAuthenticationType).length).toBe(2);
			expect(Object.isFrozen(GeoResourceAuthenticationType)).toBeTrue();
			expect(GeoResourceAuthenticationType.BAA).toBe('baa');
			expect(GeoResourceAuthenticationType.APPLICATION).toBe('application');
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

			it('provides a check for containing timestamps', () => {
				expect(new GeoResourceImpl('id').hasTimestamps()).toBeFalse();
				expect(new GeoResourceImpl('id').setTimestamps(null).hasTimestamps()).toBeFalse();
				expect(new GeoResourceImpl('id').setTimestamps(['0']).hasTimestamps()).toBeTrue();
			});

			it('provides a check for containing an update interval', () => {
				class UpdatableGeoResourceImpl extends GeoResource {
					constructor(id, label) {
						super(id, label);
					}

					isUpdatableByInterval() {
						return true;
					}
				}

				expect(new GeoResourceImpl('id').hasUpdateInterval()).toBeFalse();
				expect(new GeoResourceImpl('id').setUpdateInterval(null).hasUpdateInterval()).toBeFalse();
				expect(new GeoResourceImpl('id').setUpdateInterval(100).hasUpdateInterval()).toBeFalse();
				expect(new UpdatableGeoResourceImpl('id').setUpdateInterval(100).hasUpdateInterval()).toBeTrue();
			});

			it('provides a check for containing a description', () => {
				expect(new GeoResourceImpl('id').hasDescription()).toBeFalse();
				expect(new GeoResourceImpl('id').setDescription('').hasDescription()).toBeFalse();
				expect(new GeoResourceImpl('id').setDescription(null).hasDescription()).toBeFalse();
				expect(new GeoResourceImpl('id').setDescription(123).hasDescription()).toBeFalse();
				expect(new GeoResourceImpl('id').setDescription('desc').hasDescription()).toBeTrue();
			});

			it('provides a check if it is upgradable by an interval', () => {
				expect(new GeoResourceImpl('id').isUpdatableByInterval()).toBeFalse();
			});

			it('provides a check if it is stylable', () => {
				expect(new GeoResourceImpl('id').isStylable()).toBeFalse();
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

			it('returns an attribution for the default zoomLevel provided by the provider', () => {
				const minimalAttribution = getMinimalAttribution();
				const spy = jasmine.createSpy().and.returnValue(minimalAttribution);
				const grs = new GeoResourceImpl('id');
				grs.setAttribution('foo');
				grs.setAttributionProvider(spy);

				const result = grs.getAttribution();

				expect(spy).toHaveBeenCalledWith(grs, 0);
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

			describe('setAuthRoles', () => {
				it('updates also the authentication type', () => {
					const roles = ['TEST'];
					const geoResource = new GeoResourceNoImpl('id0');

					geoResource.setAuthRoles(null);

					expect(geoResource.authenticationType).toBeNull();
					expect(geoResource.authRoles).toEqual([]);

					geoResource.setAuthRoles(roles);

					expect(geoResource.authenticationType).toEqual(GeoResourceAuthenticationType.APPLICATION);
					expect(geoResource.authRoles).toEqual(roles);
				});

				it('does NOT update the authentication type when roles are empty', () => {
					const geoResource = new GeoResourceNoImpl('id0');

					geoResource.setAuthRoles([]);

					expect(geoResource.authenticationType).toBeNull();
				});
			});
		});

		describe('properties', () => {
			it('provides default properties', () => {
				setup();
				const geoResource = new GeoResourceNoImpl('id');

				expect(geoResource.label).toBeNull();
				expect(geoResource.opacity).toBe(1);
				expect(geoResource.minZoom).toBeNull();
				expect(geoResource.maxZoom).toBeNull();
				expect(geoResource.hidden).toBeFalse();
				expect(geoResource.attribution).toBeNull();
				expect(geoResource.authenticationType).toBeNull();
				expect(geoResource.attributionProvider).toBe(getDefaultAttribution);
				expect(geoResource.queryable).toBeTrue();
				expect(geoResource.exportable).toBeTrue();
				expect(geoResource.authRoles).toEqual([]);
				expect(geoResource.timestamps).toEqual([]);
				expect(geoResource.updateInterval).toBeNull();
				expect(geoResource.description).toBeNull();
			});

			it('provides set methods and getters', () => {
				setup();
				const roles = ['TEST'];
				const timestamps = ['20001231'];
				const geoResource = new GeoResourceNoImpl('id');

				geoResource
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setHidden(true)
					.setLabel('some label')
					.setAttribution('some attribution')
					.setQueryable(false)
					.setExportable(false)
					.setAuthRoles(roles)
					.setAuthenticationType(GeoResourceAuthenticationType.BAA)
					.setTimestamps(timestamps);

				expect(geoResource.hidden).toBeTrue();
				expect(geoResource.opacity).toBe(0.5);
				expect(geoResource.minZoom).toBe(5);
				expect(geoResource.maxZoom).toBe(19);
				expect(geoResource.label).toBe('some label');
				expect(geoResource.attribution).toBe('some attribution');
				expect(geoResource.authenticationType).toEqual(GeoResourceAuthenticationType.BAA);
				expect(geoResource.queryable).toBeFalse();
				expect(geoResource.exportable).toBeFalse();
				expect(geoResource.authRoles).toEqual(roles);
				expect(geoResource.authRoles === roles).toBeFalse(); //must be a shallow copy
				expect(geoResource.timestamps).toEqual(timestamps);
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
			} catch {
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
			expect(wmsGeoResource.maxSize).toBeNull();
		});

		describe('methods', () => {
			it('checks if it is updatable by an interval', () => {
				expect(new WmsGeoResource('id', 'label', 'url', 'layers', 'format').isUpdatableByInterval()).toBeTrue();
			});

			it('sets the `maxSize`', () => {
				const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format').setMaxSize(null);

				expect(wmsGeoResource.maxSize).toBeNull();

				wmsGeoResource.setMaxSize([21, 42]);

				expect(wmsGeoResource.maxSize).toEqual([21, 42]);
			});

			it('sets `extraParams`', () => {
				const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format').setExtraParams(null);

				expect(wmsGeoResource.extraParams).toEqual({});

				wmsGeoResource.setExtraParams({ foo: 'bar' });

				expect(wmsGeoResource.extraParams).toEqual({ foo: 'bar' });
			});
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

	describe('AbstractVectorGeoResource', () => {
		class TestVectorGeoResource extends AbstractVectorGeoResource {
			constructor(id, label) {
				super(id, label);
			}
		}
		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new AbstractVectorGeoResource('id', 'label')).toThrowError(Error, 'Can not construct abstract class.');
			});
		});

		it('instantiates an implementation', () => {
			const testVectorGeoResource = new TestVectorGeoResource('id', 'label');

			expect(testVectorGeoResource.id).toBe('id');
			expect(testVectorGeoResource.label).toBe('label');
		});

		it('provides default properties', () => {
			const testVectorGeoResource = new TestVectorGeoResource('id', 'label');

			expect(testVectorGeoResource.displayFeatureLabels).toBeTrue();
			expect(testVectorGeoResource.clusterParams).toEqual({});
			expect(testVectorGeoResource.styleHint).toBeNull();
			expect(testVectorGeoResource.style).toBeNull();
			expect(testVectorGeoResource.collaborativeData).toBeFalse();
		});

		describe('methods', () => {
			it('provides a check for containing a non-default value as `clusterParam`', () => {
				expect(new TestVectorGeoResource('id', 'label').isClustered()).toBeFalse();
				expect(new TestVectorGeoResource('id', 'label').setClusterParams(null).isClustered()).toBeFalse();
				expect(new TestVectorGeoResource('id', 'label').setClusterParams({ foo: 'bar' }).isClustered()).toBeTrue();
			});

			it('provides a check for containing a non-default value as `styleHint`', () => {
				expect(new TestVectorGeoResource('id', 'label').hasStyleHint()).toBeFalse();
				expect(new TestVectorGeoResource('id', 'label').setStyleHint(undefined).hasStyleHint()).toBeFalse();
				expect(new TestVectorGeoResource('id', 'label').setClusterParams({ foo: 'bar' }).hasStyleHint()).toBeTrue();
				expect(new TestVectorGeoResource('id', 'label').setStyleHint(StyleHint.HIGHLIGHT).setStyleHint(null).styleHint).toBeNull();
				expect(new TestVectorGeoResource('id', 'label').setStyleHint(StyleHint.HIGHLIGHT).hasStyleHint()).toBeTrue();
			});

			it('sets the `displayFeatureLabels` property', () => {
				expect(new TestVectorGeoResource('id', 'label').setDisplayFeatureLabels(false).displayFeatureLabels).toBeFalse();
				expect(new TestVectorGeoResource('id', 'label').setDisplayFeatureLabels(true).displayFeatureLabels).toBeTrue();
			});

			it('sets the `collaborativeData` property', () => {
				expect(new TestVectorGeoResource('id', 'label').markAsCollaborativeData(false).collaborativeData).toBeFalse();
				expect(new TestVectorGeoResource('id', 'label').markAsCollaborativeData(true).collaborativeData).toBeTrue();
			});

			it('sets the `styleHint` property', () => {
				expect(new TestVectorGeoResource('id', 'label').setClusterParams({ foo: 'bar' }).styleHint).toBe(StyleHint.CLUSTER);
				expect(new TestVectorGeoResource('id', 'label').setStyleHint(StyleHint.HIGHLIGHT).styleHint).toBe(StyleHint.HIGHLIGHT);
				expect(new TestVectorGeoResource('id', 'label').setStyleHint(StyleHint.HIGHLIGHT).setStyleHint(null).styleHint).toBeNull();
			});

			it('sets the `style` property', () => {
				expect(new TestVectorGeoResource('id', 'label').setStyle(undefined).style).toBeNull();
				expect(new TestVectorGeoResource('id', 'label').setStyle(undefined).hasStyle()).toBeFalse();
				expect(new TestVectorGeoResource('id', 'label').setStyle({ baseColor: '#ff0000' }).style).toEqual({ baseColor: '#ff0000' });
				expect(new TestVectorGeoResource('id', 'label').setStyle({ baseColor: '#ff0000' }).setStyle(null).style).toBeNull();
				expect(new TestVectorGeoResource('id', 'label').setStyle({ baseColor: '#ff0000' }).hasStyle()).toBeTrue();
			});
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

			expect(vectorGeoResource).toBeInstanceOf(AbstractVectorGeoResource);
			expect(vectorGeoResource.getType()).toEqual(GeoResourceTypes.VECTOR);
			expect(vectorGeoResource.id).toBe('id');
			expect(vectorGeoResource.label).toBe('label');
			expect(vectorGeoResource.srid).toBeNull();
			expect(vectorGeoResource.sourceType).toEqual(VectorSourceType.KML);
			expect(vectorGeoResource.data).toBeNull();
			expect(vectorGeoResource.localData).toBeFalse();
			expect(vectorGeoResource.features).toEqual([]);
			expect(vectorGeoResource.lastModified).toBeNull();
			expect(new VectorGeoResource('id', 'label').sourceType).toBeNull();
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

		it('sets the source of an internal VectorGeoResource by an array of features', () => {
			const feat0 = new BaFeature(new BaGeometry('data', SourceType.forGpx()), 'id0');
			const feat1 = new BaFeature(new BaGeometry('data', SourceType.forGpx()), 'id1');
			const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setFeatures([feat0]).addFeature(feat1);

			expect(vectorGeoResource.features).toEqual([feat0, feat1]);
		});

		describe('methods', () => {
			it('checks if it is stylable', () => {
				expect(new VectorGeoResource(FEATURE_COLLECTION_GEORESOURCE_ID, 'label', VectorSourceType.GEOJSON).isStylable()).toBeFalse();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).isStylable()).toBeFalse();

				expect(new VectorGeoResource('id', 'label', VectorSourceType.EWKT).isStylable()).toBeTrue();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.GPX).isStylable()).toBeTrue();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.GEOJSON).isStylable()).toBeTrue();
				expect(new VectorGeoResource('id', 'label').isStylable()).toBeTrue();
			});

			it('sets the source of an internal VectorGeoResource by a string', () => {
				const vectorGeoResource = new VectorGeoResource('id', 'label', VectorSourceType.KML).setSource('someData', 1234);

				expect(vectorGeoResource.data).toBe('someData');
				expect(vectorGeoResource.srid).toBe(1234);
			});

			it('sets the `localData` property', () => {
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).markAsLocalData(false).localData).toBeFalse();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).markAsLocalData(true).localData).toBeTrue();
			});

			it('sets the `lastModified` timestamp property', () => {
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).setLastModified(null).lastModified).toBeNull();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).setLastModified('12345').lastModified).toBeNull();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).setLastModified(12345).lastModified).toBe(12345);
			});

			it('provides a check for the `localData` flag', () => {
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).markAsLocalData(false).hasLocalData()).toBeFalse();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).markAsLocalData(true).hasLocalData()).toBeTrue();
			});

			it('provides a check for a `lastModified` timestamp', () => {
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).hasLastModifiedTimestamp()).toBeFalse();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).setLastModified(12345).hasLastModifiedTimestamp()).toBeTrue();
			});

			it('provides a check for containing features', () => {
				const feat0 = new BaFeature(new BaGeometry('data', SourceType.forGpx()), 'id0');
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).hasFeatures()).toBeFalse();
				expect(new VectorGeoResource('id', 'label', VectorSourceType.KML).addFeature(feat0).hasFeatures()).toBeTrue();
			});

			it('provides a check for containing a non-default value as label', () => {
				expect(new VectorGeoResource('id', null, VectorSourceType.KML).hasLabel()).toBeFalse();
				expect(new VectorGeoResource('id', '', VectorSourceType.KML).hasLabel()).toBeFalse();
				expect(new VectorGeoResource('id', 'foo', VectorSourceType.KML).hasLabel()).toBeTrue();
			});
		});
	});

	describe('RtVectorGeoResource', () => {
		it('instantiates a RtVectorGeoResource', () => {
			const rtVectorGeoResource = new RtVectorGeoResource('id', 'label', 'url', VectorSourceType.KML);

			expect(rtVectorGeoResource).toBeInstanceOf(AbstractVectorGeoResource);
			expect(rtVectorGeoResource.getType()).toEqual(GeoResourceTypes.RT_VECTOR);
			expect(rtVectorGeoResource.id).toBe('id');
			expect(rtVectorGeoResource.label).toBe('label');
			expect(rtVectorGeoResource.url).toBe('url');
			expect(rtVectorGeoResource.sourceType).toEqual(VectorSourceType.KML);
		});
	});

	describe('OafGeoResource', () => {
		it('instantiates a OafGeoResource', () => {
			const oafGeoResource = new OafGeoResource('id', 'label', 'url', 'collectionId', 12345);

			expect(oafGeoResource).toBeInstanceOf(AbstractVectorGeoResource);
			expect(oafGeoResource.getType()).toEqual(GeoResourceTypes.OAF);
			expect(oafGeoResource.id).toBe('id');
			expect(oafGeoResource.label).toBe('label');
			expect(oafGeoResource.url).toBe('url');
			expect(oafGeoResource.collectionId).toBe('collectionId');
			expect(oafGeoResource.srid).toBe(12345);
			expect(oafGeoResource.apiLevel).toBe(2);
		});

		it('provides default properties', () => {
			const oafGeoResource = new OafGeoResource('id', 'label', 'url', 'collectionId', 12345);

			expect(oafGeoResource.limit).toBeNull();
		});

		describe('methods', () => {
			it('checks if it is updatable by an interval', () => {
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).isUpdatableByInterval()).toBeTrue();
			});

			it('checks if it is stylable', () => {
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).isStylable()).toBeTrue();
			});

			it('sets the limit', () => {
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).hasLimit()).toBeFalse();
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setLimit('1000')).toBeNull;
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setLimit(1000).hasLimit()).toBeTrue();
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setLimit(1000).limit).toBe(1000);
			});

			it('sets the filter', () => {
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).hasFilter()).toBeFalse();
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setFilter(1000)).toBeNull;
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setFilter('filterExpr').hasFilter()).toBeTrue();
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setFilter('filterExpr').filter).toBe('filterExpr');
			});

			it('sets the apiLevel', () => {
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setApiLevel('invalid').apiLevel).toBe(2);
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setApiLevel(3).apiLevel).toBe(3);
			});

			it('checks if it is filterable', () => {
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setApiLevel(2).isFilterable()).toBeFalse();
				expect(new OafGeoResource('id', 'label', 'url', 'collectionId', 12345).setApiLevel(3).isFilterable()).toBeTrue();
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
