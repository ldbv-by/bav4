
import { LineString, Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { $injector } from '../../../../src/injection';
import { BvvMfp3Encoder } from '../../../../src/modules/olMap/services/Mfp3Encoder';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { GeoResource, GeoResourceTypes } from '../../../../src/domain/geoResources';
import { Feature } from 'ol';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { Circle as CircleStyle } from 'ol/style';
import { Icon as IconStyle, Text as TextStyle } from 'ol/style';
import { measureStyleFunction } from '../../../../src/modules/olMap/utils/olStyleUtils';
import { fromLonLat } from 'ol/proj';
import { WMTS, XYZ } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import LayerGroup from 'ol/layer/Group';
import TileGrid from 'ol/tilegrid/TileGrid';
import { AdvWmtsTileGrid } from '../../../../src/modules/olMap/ol/tileGrid/AdvWmtsTileGrid';
import { MeasurementOverlayTypes } from '../../../../src/modules/olMap/components/MeasurementOverlay';

describe('BvvMfp3Encoder', () => {

	const viewMock = { getCenter: () => [50, 50], calculateExtent: () => [0, 0, 100, 100], getResolution: () => 10 };
	const mapMock = {
		getSize: () => [100, 100],
		getCoordinateFromPixel: (p) => p,
		getView: () => viewMock,
		getLayers: () => {
			return { getArray: () => [{ get: () => 'foo', getExtent: () => [20, 20, 50, 50] }] };
		},
		getOverlays: () => {
			return { getArray: () => [] };
		}
	};

	const layerSpecMock = { specs: [], dataOwners: [], thirdPartyDataOwners: [] };

	const geoResourceServiceMock = { byId: () => { } };

	const mapServiceMock = {
		getDefaultMapExtent() { },
		getDefaultGeodeticSrid: () => 25832,
		getSrid: () => 3857
	};

	const urlServiceMock = {
		shorten: () => 'http://url.to/shorten',
		qrCode: () => 'http://url.to/shorten.png'
	};

	const shareServiceMock = {
		encodeState() { },
		copyToClipboard() { }
	};

	const mfpServiceMock = {
		getCapabilities() {
			return { grSubstitutions: { 'test_xyz': 'wmts_print', 'test_wmts': 'wmts_print' }, layouts: [] };
		},
		getLayoutById() {
			return { scales: [42, 21, 1] };
		}
	};

	const layerServiceMock = {
		toOlLayer() {
			return {};
		}
	};

	const defaultProperties = {
		layoutId: 'foo',
		scale: 1,
		dpi: 42,
		rotation: null
	};

	$injector.registerSingleton('MapService', mapServiceMock)
		.registerSingleton('GeoResourceService', geoResourceServiceMock)
		.registerSingleton('UrlService', urlServiceMock)
		.registerSingleton('ShareService', shareServiceMock)
		.registerSingleton('MfpService', mfpServiceMock)
		.registerSingleton('LayerService', layerServiceMock);
	proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
	register(proj4);
	const setup = (initProperties) => {
		const encoder = new BvvMfp3Encoder();
		encoder._mfpProperties = { ...defaultProperties, ...initProperties };
		encoder._mfpProjection = 'EPSG:25832';
		return encoder;
	};
	describe('constructor', () => {
		it('initialize with default properties', () => {
			const classUnderTest = new BvvMfp3Encoder();

			expect(classUnderTest).toBeInstanceOf(BvvMfp3Encoder);
			expect(classUnderTest._mapService).toBeTruthy();
			expect(classUnderTest._geoResourceService).toBeTruthy();
			expect(classUnderTest._mapProjection).toBe('EPSG:3857');
		});

	});

	describe('when encoding a map', () => {
		const getProperties = (initProperties = {}) => {
			return { ...defaultProperties, ...initProperties };
		};



		class TestGeoResource extends GeoResource {
			constructor(type, label) {
				super(`test_${label}`);
				this._type = type;
			}

			/**
			* @override
			*/
			getType() {
				return this._type;
			}

			get url() {
				return '';
			}
		}

		it('encodes with TargetSRID as mfpProjection', async () => {
			const encodingProperties = getProperties({ ...defaultProperties, targetSRID: '25832' });

			const encoder = new BvvMfp3Encoder();
			spyOn(encoder, '_encode').and.callFake(() => layerSpecMock);

			await encoder.encode(mapMock, encodingProperties);

			expect(encoder._mfpProperties).toBe(encodingProperties);
			expect(encoder._mfpProjection).toBe('EPSG:25832');
		});

		it('fails to encode for invalid properties', async () => {
			const baseProps = { dpi: 42, rotation: null, mapCenter: new Point([42, 21]), mapExtent: [0, 0, 42, 21] };

			const encoder = new BvvMfp3Encoder();

			await expectAsync(encoder.encode(mapMock, { ...baseProps, layoutId: null, scale: 1 })).toBeRejectedWithError();
			await expectAsync(encoder.encode(mapMock, { ...baseProps, layoutId: 'bar', scale: null })).toBeRejectedWithError();
			await expectAsync(encoder.encode(mapMock, { ...baseProps, layoutId: 'bar', scale: 0 })).toBeRejectedWithError();
		});

		it('uses the provided pageCenter for the specs', async () => {
			const pageCenter = new Point(fromLonLat([11.57245, 48.14021]));
			const mapCenterSpy = spyOn(viewMock, 'getCenter').and.callThrough();
			const encoder = new BvvMfp3Encoder();

			const actualSpec = await encoder.encode(mapMock, getProperties({ pageCenter: pageCenter }));

			expect(mapCenterSpy).not.toHaveBeenCalled();
			expect(actualSpec.attributes.map.center[0]).toBeCloseTo(691365.6, -1);
			expect(actualSpec.attributes.map.center[1]).toBeCloseTo(5335084.7, -1);
		});

		it('uses the provided pageExtent for the specs', async () => {
			const mapExtentSpy = spyOn(viewMock, 'calculateExtent').and.callThrough();
			const encoder = new BvvMfp3Encoder();

			await encoder.encode(mapMock, getProperties({ pageExtent: [0, 0, 42, 21] }));

			expect(mapExtentSpy).not.toHaveBeenCalled();
		});

		it('requests the corresponding geoResource for a layer', async () => {
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(null, 'something', 'something'));
			const encoder = new BvvMfp3Encoder();

			await encoder.encode(mapMock, getProperties());

			expect(geoResourceServiceSpy).toHaveBeenCalled();
		});

		it('encodes a aggregate layer', async () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.AGGREGATE, 'aggregate'));
			const encoder = new BvvMfp3Encoder();
			const groupLayer = new LayerGroup('foo');
			const layerMock = { get: () => 'foo' };
			spyOn(groupLayer, 'getLayers').and.callFake(() => {
				return { getArray: () => [layerMock, layerMock, layerMock] };
			});
			spyOn(mapMock, 'getLayers').and.callFake(() => {
				return { getArray: () => [groupLayer] };
			});
			const encodingGroupSpy = spyOn(encoder, '_encodeGroup').and.callThrough();
			const encodingSpy = spyOn(encoder, '_encode').and.callThrough();

			await encoder.encode(mapMock, getProperties());

			expect(encodingGroupSpy).toHaveBeenCalled();
			expect(encodingSpy).toHaveBeenCalledTimes(4); // 1 initial call for the grouplayer and 3 calls for the sublayers
		});

		it('encodes a vector layer', async () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.VECTOR, 'vector'));
			const encoder = new BvvMfp3Encoder();
			const encodingSpy = spyOn(encoder, '_encodeVector').and.callFake(() => {
				return {};
			});

			await encoder.encode(mapMock, getProperties());

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes a WMTS layer', async () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.XYZ, 'xyz'));
			const encoder = new BvvMfp3Encoder();
			const encodingSpy = spyOn(encoder, '_encodeWMTS').and.callFake(() => {
				return {};
			});

			await encoder.encode(mapMock, getProperties());

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes overlays', async () => {
			const mapSpy = spyOn(mapMock, 'getOverlays').and.returnValue({ getArray: () => [{}, {}] });
			const encoder = new BvvMfp3Encoder();
			const encodingSpy = spyOn(encoder, '_encodeOverlay').and.callFake(() => {
				return {};
			});

			await encoder.encode(mapMock, getProperties());

			expect(encodingSpy).toHaveBeenCalledTimes(2);
			expect(mapSpy).toHaveBeenCalled();
		});

		it('encodes wms', async () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.WMS, 'wms'));
			const encoder = new BvvMfp3Encoder();
			const encodingSpy = spyOn(encoder, '_encodeWMS').and.callFake(() => {
				return {};
			});

			await encoder.encode(mapMock, getProperties());

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('does NOT encode a layer, if a geoResource is not defined', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => null);
			const encoder = new BvvMfp3Encoder();
			const layerMock = { get: () => 'foo' };

			const actualEncoded = encoder._encode(layerMock, getProperties());

			expect(actualEncoded).toBeFalse();
		});

		it('encodes two layers with attributions', async () => {
			const tileGrid = {
				getTileSize: () => 42
			};
			const sourceMock = {
				getTileGrid: () => tileGrid,
				getUrls: () => ['https://some.url/to/foo/{z}/{x}/{y}'],
				getParams: () => []
			};
			const geoResourceFoo = new TestGeoResource(GeoResourceTypes.WMS).setAttribution({ copyright: { label: 'Foo CopyRight' } });
			const geoResourceBar = new TestGeoResource(GeoResourceTypes.WMS).setAttribution({ copyright: { label: 'Bar CopyRight' } });
			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('foo').and.callFake(() => geoResourceFoo)
				.withArgs('bar').and.callFake(() => geoResourceBar);
			const encoder = new BvvMfp3Encoder();

			spyOn(mapMock, 'getLayers').and.callFake(() => {
				return {
					getArray: () => [
						{ get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 },
						{ get: () => 'bar', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 }]
				};
			});
			const actualSpec = await encoder.encode(mapMock, getProperties());

			expect(actualSpec).toEqual({
				layout: 'foo',
				attributes: {
					map: {
						layers: jasmine.any(Array),
						center: jasmine.any(Array),
						scale: jasmine.any(Number),
						projection: 'EPSG:25832',
						dpi: jasmine.any(Number),
						rotation: null
					},
					dataOwner: 'Foo CopyRight,Bar CopyRight',
					thirdPartyDataOwner: '',
					shortLink: 'http://url.to/shorten',
					qrcodeurl: 'http://url.to/shorten.png'
				}
			});
		});

		it('encodes layers with third party attributions', async () => {
			const tileGrid = {
				getTileSize: () => 42
			};
			const sourceMock = {
				getTileGrid: () => tileGrid,
				getUrls: () => ['https://some.url/to/foo/{z}/{x}/{y}'],
				getParams: () => []
			};
			const geoResourceFoo = new TestGeoResource(GeoResourceTypes.WMS).setAttribution({ copyright: { label: 'Foo CopyRight' } }).setImportedByUser(true);
			const geoResourceBar = new TestGeoResource(GeoResourceTypes.WMS).setAttribution({ copyright: { label: 'Bar CopyRight' } });
			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('foo').and.callFake(() => geoResourceFoo)
				.withArgs('bar').and.callFake(() => geoResourceBar);
			const encoder = new BvvMfp3Encoder();

			spyOn(mapMock, 'getLayers').and.callFake(() => {
				return {
					getArray: () => [
						{ get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 },
						{ get: () => 'bar', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 }]
				};
			});
			const actualSpec = await encoder.encode(mapMock, getProperties());

			expect(actualSpec).toEqual({
				layout: 'foo',
				attributes: {
					map: {
						layers: jasmine.any(Array),
						center: jasmine.any(Array),
						scale: jasmine.any(Number),
						projection: 'EPSG:25832',
						dpi: jasmine.any(Number),
						rotation: null
					},
					dataOwner: 'Bar CopyRight',
					thirdPartyDataOwner: 'Foo CopyRight',
					shortLink: 'http://url.to/shorten',
					qrcodeurl: 'http://url.to/shorten.png'
				}
			});
		});

		it('encodes layers with multiple attributions', async () => {
			const tileGrid = {
				getTileSize: () => 42
			};
			const sourceMock = {
				getTileGrid: () => tileGrid,
				getUrls: () => ['https://some.url/to/foo/{z}/{x}/{y}'],
				getParams: () => []
			};
			const geoResourceFoo = new TestGeoResource(GeoResourceTypes.WMS).setAttribution({ copyright: { label: 'Foo CopyRight' } }).setImportedByUser(true);
			const geoResourceBar = new TestGeoResource(GeoResourceTypes.WMS).setAttribution({ copyright: [{ label: 'Bar CopyRight' }, { label: 'Baz CopyRight' }] });
			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('foo').and.callFake(() => geoResourceFoo)
				.withArgs('bar').and.callFake(() => geoResourceBar);
			const encoder = new BvvMfp3Encoder();

			spyOn(mapMock, 'getLayers').and.callFake(() => {
				return {
					getArray: () => [
						{ get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 },
						{ get: () => 'bar', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 }]
				};
			});
			const actualSpec = await encoder.encode(mapMock, getProperties());

			expect(actualSpec).toEqual({
				layout: 'foo',
				attributes: {
					map: {
						layers: jasmine.any(Array),
						center: jasmine.any(Array),
						scale: jasmine.any(Number),
						projection: 'EPSG:25832',
						dpi: jasmine.any(Number),
						rotation: null
					},
					dataOwner: 'Bar CopyRight,Baz CopyRight',
					thirdPartyDataOwner: 'Foo CopyRight',
					shortLink: 'http://url.to/shorten',
					qrcodeurl: 'http://url.to/shorten.png'
				}
			});
		});

		it('resolves wmts layer with wmts-source to a mfp \'wmts\' spec', () => {
			const wmtsLayerMock = { get: () => 'foo', getExtent: () => [20, 20, 50, 50], getOpacity: () => 1, id: 'wmts' };

			const encoder = setup();
			const wmtsGeoResource = new TestGeoResource(GeoResourceTypes.WMTS, 'wmts');
			spyOnProperty(wmtsGeoResource, 'url', 'get').and.returnValue('https://some.url/to/foo/{z}/{x}/{y}');
			spyOn(geoResourceServiceMock, 'byId').withArgs('wmts_print').and.returnValue(wmtsGeoResource);
			spyOn(layerServiceMock, 'toOlLayer').and.callFake(() => {
				const tileGrid = new WMTSTileGrid({ extent: [0, 0, 42, 42], resolutions: [40, 30, 20, 10], matrixIds: ['id40', 'id30', 'id20', 'id10'] });

				const wmtsSource = new WMTS({ tileGrid: tileGrid, layer: 'bar', matrixSet: 'foo', url: 'https://some.url/to/wmts/bar/{TileMatrix}/{TileCol}/{TileRow}', requestEncoding: 'REST' });
				return new TileLayer({
					id: 'foo',
					geoResourceId: 'geoResource.id',
					source: wmtsSource,
					opacity: 0.42
				});
			});
			const actualSpec = encoder._encodeWMTS(wmtsLayerMock, wmtsGeoResource);

			expect(actualSpec).toEqual({
				opacity: 1,
				type: 'wmts',
				layer: 'bar',
				requestEncoding: 'REST',
				matrixSet: 'EPSG:25832',
				matrices: jasmine.any(Object),
				baseURL: 'https://some.url/to/wmts/bar/{TileMatrix}/{TileCol}/{TileRow}',
				attribution: null,
				thirdPartyAttribution: null
			});
		});

		it('resolves wmts layer with xyz-source to a mfp \'wmts\' spec', () => {
			const wmtsLayerMock = { get: () => 'foo', getExtent: () => [20, 20, 50, 50], getOpacity: () => 1, id: 'wmts' };

			const encoder = setup();
			const xyzGeoResource = new TestGeoResource(GeoResourceTypes.XYZ, 'xyz');
			spyOnProperty(xyzGeoResource, 'url', 'get').and.returnValue('https://some.url/to/foo/{z}/{x}/{y}');
			spyOn(geoResourceServiceMock, 'byId').withArgs('wmts_print').and.returnValue(xyzGeoResource);
			spyOn(layerServiceMock, 'toOlLayer').and.callFake(() => {
				const tileGrid = new TileGrid({ extent: [0, 0, 42, 42], resolutions: [40, 30, 20, 10] });

				const xyzSource = new XYZ({ tileGrid: tileGrid, layer: 'bar', matrixSet: 'foo', url: 'https://some.url/to/wmts/bar/{z}/{x}/{y}', requestEncoding: 'REST' });
				return new TileLayer({
					id: 'foo',
					geoResourceId: 'geoResourceId',
					source: xyzSource,
					opacity: 0.42
				});
			});
			const actualSpec = encoder._encodeWMTS(wmtsLayerMock, xyzGeoResource);

			expect(actualSpec).toEqual({
				opacity: 1,
				type: 'wmts',
				layer: 'geoResourceId',
				requestEncoding: 'REST',
				matrixSet: 'EPSG:25832',
				matrices: jasmine.any(Object),
				baseURL: 'https://some.url/to/wmts/bar/{TileMatrix}/{TileCol}/{TileRow}',
				attribution: null,
				thirdPartyAttribution: null
			});
		});

		it('does NOT resolve wmts layer to a mfp \'wmts\' spec due to missing substitution georesource', () => {
			const wmtsLayerMock = { get: () => 'foo', getExtent: () => [20, 20, 50, 50], getOpacity: () => 1, id: 'wmts' };
			const encoder = setup();
			const wmtsGeoResource = new TestGeoResource(GeoResourceTypes.WMTS, 'something');
			spyOnProperty(wmtsGeoResource, 'url', 'get').and.returnValue('https://some.url/to/foo/{z}/{x}/{y}');
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'byId').and.callThrough();
			const layerServiceSpy = spyOn(layerServiceMock, 'toOlLayer').and.callThrough();
			const warnSpy = spyOn(console, 'warn');

			const actualSpec = encoder._encodeWMTS(wmtsLayerMock, wmtsGeoResource);

			expect(warnSpy).toHaveBeenCalledOnceWith('Missing substitution for GeoResource \'test_something\'.');
			expect(actualSpec).toEqual([]);
			expect(geoResourceServiceSpy).not.toHaveBeenCalled();
			expect(layerServiceSpy).not.toHaveBeenCalled();
		});

		it('resolves wms layer to a mfp \'wms\' spec', () => {
			const sourceMock = {
				getUrl: () => 'https://some.url/to/wms',
				getParams: () => {
					return { LAYERS: 'foo,bar', STYLES: 'baz' };
				}
			};
			const wmsLayerMock = { get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 };

			const wmsGeoResourceMock = {
				id: 'foo', format: 'image/png', get attribution() {
					return { copyright: { label: 'Foo CopyRight' } };
				}, importedByUser: false
			};
			const encoder = setup();
			const actualSpec = encoder._encodeWMS(wmsLayerMock, wmsGeoResourceMock);

			expect(actualSpec).toEqual({
				opacity: 1,
				type: 'wms',
				name: 'foo',
				imageFormat: 'image/png',
				baseURL: 'https://some.url/to/wms',
				layers: ['foo', 'bar'],
				styles: ['baz'],
				attribution: { copyright: { label: 'Foo CopyRight' } },
				thirdPartyAttribution: null
			});
		});

		describe('when resolving a vector layer to a mfp \'geojson\' spec', () => {
			const getStyle = () => {
				const fill = new Fill({
					color: 'rgba(255,255,255,0.4)'
				});
				const stroke = new Stroke({
					color: '#3399CC',
					width: 1.25
				});
				const styles = [
					new Style({
						image: new CircleStyle({
							fill: fill,
							stroke: stroke,
							radius: 5
						}),
						fill: fill,
						stroke: stroke
					})
				];
				return styles;
			};

			const getGeometryStyleFunction = () => {
				return measureStyleFunction;
			};

			const getTextStyle = (textAlign = 'center', textBaseline = 'middle') => {
				const fill = new Fill({
					color: 'rgba(255,255,255,0.4)'
				});
				const textFill = new Fill({
					color: 'rgb(0,0,0)'
				});
				const stroke = new Stroke({
					color: '#3399CC',
					width: 1.25
				});
				const styles = [
					new Style({
						image: new CircleStyle({
							fill: fill,
							stroke: stroke,
							radius: 5
						}),
						text: new TextStyle({ text: 'FooBarBaz', font: 'normal 10px sans-serif', fill: textFill, textAlign: textAlign, textBaseline: textBaseline })
					})
				];
				return styles;
			};

			const getImageStyle = () => {
				const styles = [
					new Style({
						image: new IconStyle({
							anchor: [42, 42],
							anchorXUnits: 'pixels',
							anchorYUnits: 'pixels',
							src: 'https://some.url/to/image/foo.png'
						})
					})
				];
				return styles;
			};

			const getStrokeStyle = () => {
				const stroke = new Stroke({
					color: '#3399CC',
					width: 1.25
				});
				const styles = [
					new Style({
						stroke: stroke
					})
				];
				return styles;
			};

			const getFillStyle = () => {
				const fill = new Fill({
					color: 'rgba(255,255,255,0.4)'
				});
				const styles = [
					new Style({
						fill: fill
					})
				];
				return styles;
			};

			const getGeoResourceMock = () => {
				return {
					id: 'foo', get attribution() {
						return { copyright: { label: 'Foo CopyRight' } };
					}, importedByUser: false
				};
			};

			it('writes a point feature transformed to target srid', () => {
				const vectorSource = new VectorSource({ wrapX: false, features: [new Feature({ geometry: new Point(fromLonLat([11.59036, 48.14165])) })] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });
				vectorLayer.setStyle(() => getStyle());
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);
				const expectedCoordinate = [692692, 5335289];
				const actualCoordinate = actualSpec.geoJson.features[0].geometry.coordinates;

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: jasmine.any(Object)
				});

				expect(actualCoordinate[0]).toBeCloseTo(expectedCoordinate[0], 0);
				expect(actualCoordinate[1]).toBeCloseTo(expectedCoordinate[1], 0);
			});

			it('writes a point feature with layer style', () => {
				const vectorSource = new VectorSource({ wrapX: false, features: [new Feature({ geometry: new Point([30, 30]) })] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });
				vectorLayer.setStyle(() => getStyle());
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'point',
								zIndex: 0,
								rotation: 0,
								graphicWidth: 56.25,
								graphicHeight: 56.25,
								pointRadius: 5,
								fillColor: '#ffffff',
								fillOpacity: 0.4,
								strokeWidth: 2.6785714285714284,
								strokeColor: '#3399cc',
								strokeOpacity: 1,
								strokeLinecap: 'round',
								strokeLineJoin: 'round'
							}]
						}
					}
				});
			});

			it('writes a point feature with feature style version 1', () => {
				const featureWithStyle = new Feature({ geometry: new Point([30, 30]) });
				featureWithStyle.setStyle(getStyle());
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'point',
								zIndex: 0,
								rotation: 0,
								graphicWidth: 56.25,
								graphicHeight: 56.25,
								pointRadius: 5,
								fillColor: '#ffffff',
								fillOpacity: 0.4,
								strokeWidth: 2.6785714285714284,
								strokeColor: '#3399cc',
								strokeOpacity: 1,
								strokeLinecap: 'round',
								strokeLineJoin: 'round'
							}]
						}
					}
				});
			});

			it('writes a point feature with feature style (image)', () => {
				const featureWithStyle = new Feature({ geometry: new Point([30, 30]) });
				featureWithStyle.setStyle(getImageStyle());
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'point',
								zIndex: 0,
								rotation: 0,
								fillOpacity: 1,
								strokeOpacity: 0,
								graphicXOffset: jasmine.any(Number),
								graphicHeight: jasmine.any(Number),
								externalGraphic: 'https://some.url/to/image/foo.png'
							}]
						}
					}
				});
			});

			it('writes a point feature with feature style (text)', () => {
				const featureWithStyle = new Feature({ geometry: new Point([30, 30]) });
				featureWithStyle.setStyle(getTextStyle());
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'text',
								zIndex: 0,
								rotation: 0,
								fillOpacity: 0,
								strokeOpacity: 0,
								graphicWidth: 56.25,
								graphicHeight: 56.25,
								pointRadius: 5,
								label: 'FooBarBaz',
								labelXOffset: 0,
								labelYOffset: 0,
								labelAlign: 'cm',
								fontColor: '#000000',
								fontFamily: 'SANS-SERIF',
								fontSize: 10,
								fontWeight: 'normal'
							}]
						}
					}
				});
			});

			it('writes a point feature with feature style (text) and alignment', () => {
				const featureWithStyle = new Feature({ geometry: new Point([30, 30]) });
				featureWithStyle.setStyle(getTextStyle('left', 'top'));
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'text',
								zIndex: 0,
								rotation: 0,
								fillOpacity: 0,
								strokeOpacity: 0,
								graphicWidth: 56.25,
								graphicHeight: 56.25,
								pointRadius: 5,
								label: 'FooBarBaz',
								labelXOffset: 0,
								labelYOffset: 0,
								labelAlign: 'lt',
								fontColor: '#000000',
								fontFamily: 'SANS-SERIF',
								fontSize: 10,
								fontWeight: 'normal'
							}]
						}
					}
				});
			});

			it('writes a point feature with feature style function', () => {
				const featureWithStyle = new Feature({ geometry: new Point([30, 30]) });
				featureWithStyle.setStyle(() => getStyle());
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'point',
								zIndex: 0,
								rotation: 0,
								graphicWidth: 56.25,
								graphicHeight: 56.25,
								pointRadius: 5,
								fillColor: '#ffffff',
								fillOpacity: 0.4,
								strokeWidth: 2.6785714285714284,
								strokeColor: '#3399cc',
								strokeOpacity: 1,
								strokeLinecap: 'round',
								strokeLineJoin: 'round'
							}]
						}
					}
				});
			});

			it('does NOT writes a point feature without any style', () => {
				const vectorSource = new VectorSource({ wrapX: false, features: [new Feature({ geometry: new Point([30, 30]) })] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });

				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [],
						type: 'FeatureCollection'
					},
					style: {
						version: '2'
					}
				});
			});

			it('writes a line feature with stroke style', () => {
				const featureWithStyle = new Feature({ geometry: new LineString([[30, 30], [40, 40]]) });
				featureWithStyle.setStyle(getStrokeStyle());
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'LineString',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'line',
								zIndex: 0,
								fillOpacity: 0,
								strokeWidth: 2.6785714285714284,
								strokeColor: '#3399cc',
								strokeOpacity: 1,
								strokeLinecap: 'round',
								strokeLineJoin: 'round'
							}]
						}
					}
				});
			});

			it('writes a polygon feature with fill style', () => {
				const featureWithStyle = new Feature({ geometry: new Polygon([[[30, 30], [40, 40], [40, 30], [30, 30]]]) });
				featureWithStyle.setStyle(getFillStyle());
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'Polygon',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'polygon',
								zIndex: 0,
								fillColor: '#ffffff',
								fillOpacity: 0.4,
								strokeOpacity: 0
							}]
						}
					}
				});
			});

			it('writes a feature with a advanced feature style function (geometryFunction)', () => {
				const feature = new Feature({ geometry: new LineString([[30, 30], [40, 40]]), partition_delta: 0.4 });
				feature.setStyle(getGeometryStyleFunction());
				const vectorSource = new VectorSource({ wrapX: false, features: [feature] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });
				vectorLayer.setStyle(getGeometryStyleFunction());
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup();
				const actualSpec = encoder._encodeVector(vectorLayer, geoResourceMock);

				expect(actualSpec).toEqual({
					opacity: 1,
					type: 'geojson',
					name: 'foo',
					attribution: { copyright: { label: 'Foo CopyRight' } },
					thirdPartyAttribution: null,
					geoJson: {
						features: [{
							type: 'Feature',
							geometry: {
								type: 'LineString',
								coordinates: jasmine.any(Array)
							},
							properties: {
								_gx_style: 0
							}
						},
						jasmine.any(Object)], // the circle geometry as polygon
						type: 'FeatureCollection'
					},
					style: {
						version: '2',
						'[_gx_style = 0]': {
							symbolizers: [{
								type: 'line',
								zIndex: 0,
								fillOpacity: 0,
								strokeOpacity: 1,
								strokeWidth: jasmine.any(Number),
								strokeColor: '#ff0000',
								strokeLinecap: 'round',
								strokeLineJoin: 'round',
								strokeDashstyle: 'dash'
							}]
						},
						'[_gx_style = 1]': {
							symbolizers: [{
								type: 'polygon',
								zIndex: 0,
								strokeWidth: 6.428571428571429,
								strokeColor: '#ff0000',
								strokeOpacity: 1,
								strokeLinecap: 'round',
								strokeLineJoin: 'round',
								fillOpacity: 0
							}]
						}
					}
				});
			});
		});

		it('resolves overlay with element of \'ba-measure-overlay\' to a mfp \'geojson\' spec', () => {
			const distanceOverlayMock = {
				getElement: () => {
					return { tagName: 'ba-measure-overlay', innerText: 'foo bar baz', placement: { offset: [0.4, 2], positioning: 'top-center' } };
				},
				getPosition: () => [42, 21]
			};
			const partitionDistanceOverlayMock = {
				getElement: () => {
					return { tagName: 'ba-measure-overlay', innerText: 'foo bar baz', type: MeasurementOverlayTypes.DISTANCE_PARTITION, placement: { offset: [0.4, 2], positioning: 'top-center' } };
				},
				getPosition: () => [42, 21]
			};
			const encoder = setup();
			const distanceSpec = encoder._encodeOverlay(distanceOverlayMock);
			const partitionSpec = encoder._encodeOverlay(partitionDistanceOverlayMock);
			expect(distanceSpec).toEqual({
				type: 'geojson',
				name: 'overlay',
				opacity: 1,
				geoJson: {
					type: 'FeatureCollection',
					features: [{
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'Point',
							coordinates: jasmine.any(Array)
						}
					}]
				},
				style: {
					version: 2,
					'*': {
						symbolizers: [{
							type: 'point',
							fillColor: '#ff0000',
							fillOpacity: 1,
							strokeOpacity: 0,
							graphicName: 'circle',
							graphicOpacity: 0.4,
							pointRadius: 3
						}, {
							type: 'text',
							label: 'foo bar baz',
							labelXOffset: 0.5,
							labelYOffset: -2.5,
							labelAlign: 'ct',
							fontFamily: 'san-serif',
							fontColor: '#ffffff',
							fontSize: 10,
							fontWeight: 'bold',
							strokeColor: '#ff0000',
							haloColor: '#ff0000',
							haloOpacity: 1,
							haloRadius: 2
						}]
					}
				}
			});
			expect(partitionSpec).toEqual({
				type: 'geojson',
				name: 'overlay',
				opacity: 1,
				geoJson: {
					type: 'FeatureCollection',
					features: [{
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'Point',
							coordinates: jasmine.any(Array)
						}
					}]
				},
				style: {
					version: 2,
					'*': {
						symbolizers: [{
							type: 'point',
							fillColor: '#ff0000',
							fillOpacity: 1,
							strokeOpacity: 0,
							graphicName: 'circle',
							graphicOpacity: 0.4,
							pointRadius: 3
						}, {
							type: 'text',
							label: 'foo bar baz',
							labelXOffset: 0.5,
							labelYOffset: -2.5,
							labelAlign: 'ct',
							fontFamily: 'san-serif',
							fontColor: '#000000',
							fontSize: 10,
							fontWeight: 'normal',
							strokeColor: '#ff0000',
							haloColor: '#ffffff',
							haloOpacity: 1,
							haloRadius: 2
						}]
					}
				}
			});
		});

		it('does NOT resolve overlay with invalid element to a mfp \'geojson\' spec', () => {
			const overlayMock = {
				getElement: () => {
					return { tagName: 'something', innerText: 'foo bar baz', placement: { offset: [0.4, 2] } };
				},
				getPosition: () => [42, 21]
			};
			const encoder = setup();
			expect(encoder._encodeOverlay(overlayMock)).toBeNull();
		});

		it('encodes openlayers geometryType to mfp symbolizer type', () => {
			const encoder = setup();

			expect(encoder._encodeGeometryType('Point')).toBe('point');
			expect(encoder._encodeGeometryType('LineString')).toBe('line');
			expect(encoder._encodeGeometryType('Polygon')).toBe('polygon');
			expect(encoder._encodeGeometryType('ABC')).toBe('abc');
			expect(encoder._encodeGeometryType('123')).toBe('123');
			expect(encoder._encodeGeometryType('AbC')).toBe('abc');
		});
	});

	describe('_generateShortUrl', () => {
		it('shortenens the url', async () => {
			const encodedState = 'foo';
			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(encodedState);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(encodedState).and.resolveTo('bar');

			const classUnderTest = setup();

			const shortUrl = await classUnderTest._generateShortUrl();

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalled();
			expect(shortUrl).toBe('bar');
		});

		it('warns in console, if shortening fails', async () => {
			const encodedState = 'foo';
			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(encodedState);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').and.throwError('bar');
			const warnSpy = spyOn(console, 'warn');

			const classUnderTest = setup();

			const shortUrl = await classUnderTest._generateShortUrl();

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith('Could not shorten url: Error: bar');
			expect(urlServiceSpy).toThrowError('bar');
			expect(shortUrl).toBe('foo');
		});
	});

	describe('buildMatrixSets', () => {
		it('builds a tileMatrixSet', () => {
			const tileGrid = new AdvWmtsTileGrid();

			const tileMatrixSet = BvvMfp3Encoder.buildMatrixSets(tileGrid);

			expect(tileMatrixSet.length).toBe(16);

			expect(tileMatrixSet[0].identifier).toBe('0');
			expect(tileMatrixSet[0].scaleDenominator).toBeCloseTo(17471320.7508974, 5);
			expect(tileMatrixSet[0].topLeftCorner).toEqual([-46133.17, 6301219.54]);
			expect(tileMatrixSet[0].tileSize).toEqual([256, 256]);
			expect(tileMatrixSet[0].matrixSize).toEqual([1, 1]);


			expect(tileMatrixSet[15].identifier).toBe('15');
			expect(tileMatrixSet[15].scaleDenominator).toBeCloseTo(533.182395962446, 5);
			expect(tileMatrixSet[15].topLeftCorner).toEqual([-46133.17, 6301219.54]);
			expect(tileMatrixSet[15].tileSize).toEqual([256, 256]);
			expect(tileMatrixSet[15].matrixSize).toEqual([32768, 32768]);
		});
	});
});
