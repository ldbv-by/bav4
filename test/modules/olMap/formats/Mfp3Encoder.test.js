
import { Point } from 'ol/geom';
import { $injector } from '../../../../src/injection';
import { Mfp3Encoder } from '../../../../src/modules/olMap/formats/Mfp3Encoder';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { GeoResource, GeoResourceTypes } from '../../../../src/domain/geoResources';


describe('Mfp3Encoder', () => {

	const viewMock = { getCenter: () => new Point([50, 50]), calculateExtent: () => [0, 0, 100, 100], getResolution: () => 10 };
	const mapMock = {
		getSize: () => [100, 100], getCoordinateFromPixel: (p) => p, getView: () => viewMock, getLayers: () => {
			return { getArray: () => [{ get: () => 'foo', getExtent: () => [20, 20, 50, 50] }] };
		}
	};

	const geoResourceServiceMock = { byId: () => { } };

	const mapServiceMock = {
		getDefaultMapExtent() { },
		getDefaultGeodeticSrid: () => 25832,
		getSrid: () => 3857
	};

	const defaultProperties = {
		layoutId: 'foo',
		scale: 1,
		dpi: 42,
		rotation: null
	};

	$injector.registerSingleton('MapService', mapServiceMock)
		.registerSingleton('GeoResourceService', geoResourceServiceMock);
	proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
	register(proj4);

	describe('constructor', () => {
		it('initialize with default properties', () => {
			const classUnderTest = new Mfp3Encoder(defaultProperties);

			expect(classUnderTest).toBeInstanceOf(Mfp3Encoder);
			expect(classUnderTest._mapService).toBeTruthy();
			expect(classUnderTest._geoResourceService).toBeTruthy();
			expect(classUnderTest._mfpProperties).toBe(defaultProperties);
			expect(classUnderTest._mapProjection).toBe('EPSG:3857');
			expect(classUnderTest._mfpProjection).toBe('EPSG:25832');
		});

		it('fails to initialize for invalid properties', () => {
			const baseProps = { dpi: 42, rotation: null, mapCenter: new Point([42, 21]), mapExtent: [0, 0, 42, 21] };

			expect(() => new Mfp3Encoder({ ...baseProps, layoutId: null, scale: 1 })).toThrowError();
			expect(() => new Mfp3Encoder({ ...baseProps, layoutId: 'bar', scale: null })).toThrowError();
			expect(() => new Mfp3Encoder({ ...baseProps, layoutId: 'bar', scale: 0 })).toThrowError();
		});
	});

	describe('when encoding a map', () => {
		const setup = (initProperties) => {

			const properties = { ...defaultProperties, ...initProperties };
			return new Mfp3Encoder(properties);
		};

		class TestGeoResource extends GeoResource {
			constructor(type) {
				super(`test_${type.toString()}`);
				this._type = type;
			}

			/**
			* @override
			*/
			getType() {
				return this._type;
			}
		}

		it('requests the corresponding geoResource for a layer', () => {
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource('something'));
			const encoder = setup();

			encoder.encode(mapMock);

			expect(geoResourceServiceSpy).toHaveBeenCalled();
		});

		it('encodes a aggregate layer', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.AGGREGATE));
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encodeGroup').and.callFake(() => { });

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes a vector layer', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.VECTOR));
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encodeVector').and.callFake(() => { });

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes a WMTS layer', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.WMTS));
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encodeWMTS').and.callFake(() => { });

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes a WMS layer', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.WMS));
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encodeWMS').and.callFake(() => { });

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('resolves sublayers of a aggregate layer', () => {
			const subLayersMock = { getArray: () => [{ get: () => 'foo1' }, { get: () => 'foo2' }, { get: () => 'foo3' }] };
			const layersMock = { getArray: () => [{ get: () => 'foo', getExtent: () => [20, 20, 50, 50], getLayers: () => subLayersMock }] };
			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.AGGREGATE))
				.withArgs('foo1').and.callFake(() => new TestGeoResource('something'))
				.withArgs('foo2').and.callFake(() => new TestGeoResource('something'))
				.withArgs('foo3').and.callFake(() => new TestGeoResource('something'));
			spyOn(mapMock, 'getLayers').and.callFake(() => layersMock);
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encode').and.callThrough();

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalledTimes(4); //called for layer 'foo' + 'foo1' + 'foo2' + 'foo3'
		});

		it('resolves wmts layer to a mfp \'osm\' spec', () => {
			const tileGrid = {
				getTileSize: () => 42
			};
			const sourceMock = {
				getTileGrid: () => tileGrid,
				getUrls: () => ['https://some.url/to/foo/{z}/{x}/{y}']
			};
			const wmtsLayerMock = { get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 };

			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.WMTS));


			const encoder = setup();
			const actualSpec = encoder._encodeWMTS(wmtsLayerMock);

			expect(actualSpec).toEqual({
				opacity: 1,
				type: 'osm',
				baseURL: 'https://some.url/to/foo/{z}/{x}/{y}',
				tileSize: [42, 42]
			});
		});

		it('resolves wms layer to a mfp \'wms\' spec', () => {
			const sourceMock = {
				getUrls: () => ['https://some.url/to/wms'],
				getParams: () => {
					return { LAYERS: 'foo,bar', STYLES: 'baz' };
				}
			};
			const wmsLayerMock = { get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 };

			const wmsGeoResourceMock = { id: 'foo', format: 'image/png' };
			const encoder = setup();
			const actualSpec = encoder._encodeWMS(wmsLayerMock, wmsGeoResourceMock);

			expect(actualSpec).toEqual({
				opacity: 1,
				type: 'wms',
				name: 'foo',
				imageFormat: 'image/png',
				baseURL: 'https://some.url/to/wms',
				layers: ['foo', 'bar'],
				styles: ['baz']
			});
		});
	});
});
