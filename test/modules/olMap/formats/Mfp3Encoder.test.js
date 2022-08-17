
import { Circle, LineString, Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../../src/injection';
import { Mfp3Encoder } from '../../../../src/modules/olMap/formats/Mfp3Encoder';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { GeoResource, GeoResourceTypes } from '../../../../src/domain/geoResources';
import { Feature } from 'ol';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import { Icon as IconStyle, Text as TextStyle } from 'ol/style';

describe('Mfp3Encoder', () => {

	const viewMock = { getCenter: () => new Point([50, 50]), calculateExtent: () => [0, 0, 100, 100], getResolution: () => 10 };
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
			const encodingSpy = spyOn(encoder, '_encodeGroup').and.callFake(() => {
				return { };
			});

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes a vector layer', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.VECTOR));
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encodeVector').and.callFake(() => {
				return {};
			});

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes a WMTS layer', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.WMTS));
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encodeWMTS').and.callFake(() => {
				return {};
			});

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('encodes a WMS layer', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => new TestGeoResource(GeoResourceTypes.WMS));
			const encoder = setup();
			const encodingSpy = spyOn(encoder, '_encodeWMS').and.callFake(() => {
				return {};
			});

			encoder.encode(mapMock);

			expect(encodingSpy).toHaveBeenCalled();
		});

		it('does NOT encode a layer, if a geoResource is not defined', () => {
			spyOn(geoResourceServiceMock, 'byId').withArgs('foo').and.callFake(() => null);
			const encoder = setup();
			const layerMock = { get: () => 'foo' };

			const actualEncoded = encoder._encode(layerMock);

			expect(actualEncoded).toEqual([]);
		});

		it('encodes two layers with attributions', () => {
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
			const encoder = setup();

			spyOn(mapMock, 'getLayers').and.callFake(() => {
				return { getArray: () => [
					{ get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 },
					{ get: () => 'bar', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 }] };
			});
			const actualSpec = 	encoder.encode(mapMock);

			expect(actualSpec).toEqual({
				layout: 'foo',
				attributes: {
					map: {
						layers: jasmine.any(Array),
						center: jasmine.any(Point),
						scale: jasmine.any(Number),
						projection: 'EPSG:25832',
						dpi: jasmine.any(Number),
						rotation: null,
						dataOwner: 'Foo CopyRight,Bar CopyRight',
						thirdPartyDataOwner: null
					}
				}
			});
		});

		it('encodes layers with third party attributions', () => {
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
			const encoder = setup();

			spyOn(mapMock, 'getLayers').and.callFake(() => {
				return { getArray: () => [
					{ get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 },
					{ get: () => 'bar', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 }] };
			});
			const actualSpec = 	encoder.encode(mapMock);

			expect(actualSpec).toEqual({
				layout: 'foo',
				attributes: {
					map: {
						layers: jasmine.any(Array),
						center: jasmine.any(Point),
						scale: jasmine.any(Number),
						projection: 'EPSG:25832',
						dpi: jasmine.any(Number),
						rotation: null,
						dataOwner: 'Bar CopyRight',
						thirdPartyDataOwner: 'Foo CopyRight'
					}
				}
			});
		});

		it('encodes layers with multiple attributions', () => {
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
			const encoder = setup();

			spyOn(mapMock, 'getLayers').and.callFake(() => {
				return { getArray: () => [
					{ get: () => 'foo', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 },
					{ get: () => 'bar', getExtent: () => [20, 20, 50, 50], getSource: () => sourceMock, getOpacity: () => 1 }] };
			});
			const actualSpec = 	encoder.encode(mapMock);

			expect(actualSpec).toEqual({
				layout: 'foo',
				attributes: {
					map: {
						layers: jasmine.any(Array),
						center: jasmine.any(Point),
						scale: jasmine.any(Number),
						projection: 'EPSG:25832',
						dpi: jasmine.any(Number),
						rotation: null,
						dataOwner: 'Bar CopyRight,Baz CopyRight',
						thirdPartyDataOwner: 'Foo CopyRight'
					}
				}
			});
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

			const encoder = setup();
			const actualSpec = encoder._encodeWMTS(wmtsLayerMock, new TestGeoResource(GeoResourceTypes.WMTS));

			expect(actualSpec).toEqual({
				opacity: 1,
				type: 'osm',
				baseURL: 'https://some.url/to/foo/{z}/{x}/{y}',
				tileSize: [42, 42],
				attribution: null,
				thirdPartyAttribution: null
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

			const wmsGeoResourceMock = { id: 'foo', format: 'image/png', get attribution() {
				return { copyright: { label: 'Foo CopyRight' } };
			}, importedByUser: false };
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
				return [new Style({
					stroke: new Stroke({
						color: [255, 0, 0, 1],
						width: 3
					}),
					geometry: feature => {
						const coords = feature.getGeometry().getCoordinates();
						const radius = 10;
						const circle = new Circle(coords[0], radius);
						return circle;
					},
					zIndex: 0
				})];
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
							anchor: [0.5, 1],
							anchorXUnits: 'fraction',
							anchorYUnits: 'fraction',
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
				return { id: 'foo', get attribution() {
					return { copyright: { label: 'Foo CopyRight' } };
				}, importedByUser: false };
			};

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
								coordinates: [30, 30]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
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
								coordinates: [30, 30]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
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
						}
					}
				});
			});

			it('writes a point feature with feature style version 2', () => {
				const featureWithStyle = new Feature({ geometry: new Point([30, 30]) });
				featureWithStyle.setStyle(getStyle());
				const vectorSource = new VectorSource({ wrapX: false, features: [featureWithStyle] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource, style: null });
				spyOn(vectorLayer, 'getExtent').and.callFake(() => [20, 20, 50, 50]);
				const geoResourceMock = getGeoResourceMock();
				spyOn(geoResourceServiceMock, 'byId').and.callFake(() => geoResourceMock);
				const encoder = setup({ styleVersion: 2 });
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
								coordinates: [30, 30]
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
								coordinates: [30, 30]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
							zIndex: 0,
							rotation: 0,
							fillOpacity: 1,
							strokeOpacity: 0,
							externalGraphic: 'https://some.url/to/image/foo.png'
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
								coordinates: [30, 30]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
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
								coordinates: [30, 30]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
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
								coordinates: [30, 30]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
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
						version: '1',
						styleProperty: '_gx_style'
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
								coordinates: [
									[30, 30],
									[40, 40]
								]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
							zIndex: 0,
							fillOpacity: 0,
							strokeWidth: 2.6785714285714284,
							strokeColor: '#3399cc',
							strokeOpacity: 1,
							strokeLinecap: 'round',
							strokeLineJoin: 'round'
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
								coordinates: [[
									[30, 30],
									[40, 40],
									[40, 30],
									[30, 30]
								]]
							},
							properties: {
								_gx_style: 0
							}
						}],
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
							zIndex: 0,
							fillColor: '#ffffff',
							fillOpacity: 0.4,
							strokeOpacity: 0
						}
					}
				});
			});

			it('writes a feature with a advanced feature style function (geometryFunction)', () => {
				const vectorSource = new VectorSource({ wrapX: false, features: [new Feature({ geometry: new LineString([[30, 30], [40, 40]]) })] });
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
								coordinates: [[30, 30], [40, 40]]
							},
							properties: {
								_gx_style: 0
							}
						},
						jasmine.any(Object)], // the circle geometry as polygon
						type: 'FeatureCollection'
					},
					style: {
						version: '1',
						styleProperty: '_gx_style',
						0: {
							zIndex: 0,
							fillOpacity: 0,
							strokeWidth: 6.428571428571429,
							strokeColor: '#ff0000',
							strokeOpacity: 1,
							strokeLinecap: 'round',
							strokeLineJoin: 'round'
						},
						1: {
							zIndex: 0,
							strokeWidth: 6.428571428571429,
							strokeColor: '#ff0000',
							strokeOpacity: 1,
							strokeLinecap: 'round',
							strokeLineJoin: 'round',
							fillOpacity: 0
						}
					}
				});
			});
		});

		it('resolves overlay with element of \'ba-measure-overlay\' to a mfp \'geojson\' spec', () => {
			const overlayMock = {
				getElement: () => {
					return { tagName: 'ba-measure-overlay', innerText: 'foo bar baz', placement: { offset: [0.4, 2], positioning: 'top-center' } };
				},
				getPosition: () => [42, 21]
			};
			const encoder = setup();
			const actualSpec = encoder._encodeOverlay(overlayMock);

			expect(actualSpec).toEqual({
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
							coordinates: [42, 21, 0]
						}
					}]
				},
				style: {
					version: 2,
					'*': {
						symbolizers: [{
							type: 'text',
							label: 'foo bar baz',
							labelXOffset: 0.4,
							labelYOffset: 2,
							labelAlign: 'ct',
							fontColor: '#ffffff',
							fontSize: 10,
							fontWeight: 'normal',
							fillColor: '#ff0000',
							strokeColor: '#ff0000'
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

	});
});
