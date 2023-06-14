import { Feature } from 'ol';
import { VectorGeoResource } from '../../src/domain/geoResources';
import { SourceType, SourceTypeName, SourceTypeResultStatus } from '../../src/domain/sourceType';
import { OlExportVectorDataService } from '../../src/services/ExportVectorDataService';
import { TestUtils } from '../test-utils';
import { Point, LineString, Polygon } from 'ol/geom';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { $injector } from '../../src/injection';
import { fromLonLat } from 'ol/proj';

describe('ExportVectorDataService', () => {
	const EWKT_Point = 'SRID=4326;POINT(10 10)';
	const EWKT_LineString = 'SRID=4326;LINESTRING(10 10,20 20,30 40)';
	const EWKT_Polygon = 'SRID=4326;POLYGON((10 10,10 20,20 20,20 15,10 10))';
	const KML_Data =
		'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document>	<name>Zeichnung</name>	<Placemark id="polygon_1645077612885">	<ExtendedData>		<Data name="type">			<value>polygon</value>		</Data>	</ExtendedData>	<description>	</description>	<Style>		<LineStyle>			<color>ff0000ff</color>			<width>3</width>		</LineStyle>		<PolyStyle>			<color>660000ff</color>		</PolyStyle>	</Style>	<Polygon>		<outerBoundaryIs>			<LinearRing>				<coordinates>					11.248395432833206,48.599861238104666 					11.414296346422136,48.66067918795375 					11.484919041751134,48.55051466922948 					11.30524992459611,48.503527784132004 					11.248395432833206,48.599861238104666				</coordinates>			</LinearRing>		</outerBoundaryIs>	</Polygon></Placemark></Document></kml>';
	const GEOJSON_Data =
		'{"type": "FeatureCollection","name": "Geometry Example","features": [{"type": "Feature","id": "linestring_1","geometry": {"type": "LineString","coordinates": [[11.623994925, 48.103902276], [11.6238941494, 48.1038562591],[11.6237933577, 48.1038312889],[11.623671698, 48.1038326017],[11.6236550072, 48.103838031],[11.6234912923, 48.1034946718],[11.6234954066, 48.1030211821],[11.6240959829, 48.1030061469],[11.6240767886, 48.1032433238],[11.6252867619, 48.1032918834]]},"properties": {"description": "A LineString"}},{"type": "Feature","id": "point_1","geometry": {"type": "Point","coordinates":[11.6160251361, 48.1052634623]},"properties": {"title": "Point 1","description": "A valid Point style"}}]}';
	const GPX_Data =
		'<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="OpenLayers"><trk><trkseg><trkpt lat="48.599861238104666" lon="11.248395432833206"/><trkpt lat="48.66067918795375" lon="11.414296346422136"/><trkpt lat="48.55051466922948" lon="11.484919041751134"/><trkpt lat="48.503527784132004" lon="11.30524992459611"/><trkpt lat="48.599861238104666" lon="11.248395432833206"/></trkseg></trk></gpx>';

	const projectionServiceMock = {
		getProjections: () => [4326, 3857]
	};

	const sourceTypeServiceMock = {
		forData: () => 'foo/bar'
	};

	const setup = () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('ProjectionService', projectionServiceMock).registerSingleton('SourceTypeService', sourceTypeServiceMock);
		return new OlExportVectorDataService();
	};

	beforeAll(() => {
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
	});

	describe('forGeoResource', () => {
		it('uses forData', () => {
			const dataSourceType = new SourceType(SourceTypeName.EWKT);
			const targetSourceType = new SourceType(SourceTypeName.GPX);
			const vgr = new VectorGeoResource('id_foo', 'label_foo', dataSourceType);
			vgr.setSource('someData', 4326);
			const instance = setup();

			const forDataSpy = spyOn(instance, '_forData').and.returnValue('someOtherData');

			expect(instance.forGeoResource(vgr, targetSourceType)).toBe('someOtherData');
			expect(forDataSpy).toHaveBeenCalledWith('someData', dataSourceType, targetSourceType);
		});

		it('throws an error for empty geoResource.data', () => {
			const dataSourceType = new SourceType(SourceTypeName.EWKT);
			const targetSourceType = new SourceType(SourceTypeName.GPX);
			const vgr = new VectorGeoResource('id_foo', 'label_foo', dataSourceType);
			vgr.setSource(null, 4326);

			const instance = setup();

			expect(() => instance.forGeoResource(vgr, targetSourceType)).toThrowError("GeoResource 'id_foo' is empty");
		});
	});

	describe('forData', () => {
		it('returns the data, if no transformation and converting is needed', () => {
			const instance = setup();
			const sameSourceType = new SourceType('same', 1, 42);
			const readerSpy = spyOn(instance, '_getReader').and.callThrough();
			const writerSpy = spyOn(instance, '_getWriter').and.callThrough();
			const transformSpy = spyOn(instance, '_transform').and.callThrough();
			spyOn(sourceTypeServiceMock, 'forData').and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: sameSourceType });

			const actual = instance.forData('someData', sameSourceType);

			expect(actual).toBe('someData');
			expect(readerSpy).not.toHaveBeenCalled();
			expect(writerSpy).not.toHaveBeenCalled();
			expect(transformSpy).not.toHaveBeenCalled();
		});

		it('requests a transformation', () => {
			const instance = setup();
			spyOn(instance, '_getReader').and.returnValue(() => ['foo']);
			const transformSpy = spyOn(instance, '_transform').and.returnValue(() => ['bar']);
			spyOn(instance, '_getWriter').and.returnValue(() => 'baz');
			const dataSourceType = new SourceType('foo', 1, 4326);
			const targetSourceType = new SourceType('bar', 1, 3857);
			spyOn(sourceTypeServiceMock, 'forData').and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: dataSourceType });

			instance.forData('someData', targetSourceType);

			expect(transformSpy).toHaveBeenCalledWith(['foo'], 4326, 3857);
		});

		describe('when data sourceType is not resolvable', () => {
			it('throws an error', () => {
				const instance = setup();
				const targetSourceType = new SourceType('bar', 1, 3857);
				const expectedStatus = SourceTypeResultStatus.UNSUPPORTED_TYPE;
				const expectedMessage = `Unexpected SourceTypeResultStatus: ${expectedStatus}`;
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({ status: expectedStatus, sourceType: 'some' });

				expect(() => instance.forData('someData', targetSourceType)).toThrowError(expectedMessage);
			});
		});

		describe('GPX', () => {
			const FORMAT_GPX_START = '<gpx ';

			it('requests the gpx format reader', () => {
				const instance = setup();
				const formatSpy = spyOn(instance, '_getFormat').and.callThrough();
				spyOn(instance, '_getWriter').and.returnValue(() => 'bar');
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({
					status: SourceTypeResultStatus.OK,
					sourceType: new SourceType(SourceTypeName.GPX)
				});

				instance.forData('<gpx/>', new SourceType('something'));

				expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.GPX);
			});

			it('requests the gpx format writer', () => {
				const instance = setup();
				spyOn(instance, '_getReader').and.returnValue(() => []);
				const readerSpy = spyOn(instance, '_getGpxWriter').and.returnValue(() => 'bar');
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType('something') });

				instance.forData('someData', new SourceType(SourceTypeName.GPX));

				expect(readerSpy).toHaveBeenCalled();
			});

			it('writes features as gpx ', () => {
				const instance = setup();

				spyOn(sourceTypeServiceMock, 'forData')
					.withArgs(KML_Data)
					.and.returnValues({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.KML) })
					.withArgs(EWKT_Polygon)
					.and.returnValues({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.EWKT) })
					.withArgs(GEOJSON_Data)
					.and.returnValues({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.GEOJSON) });

				expect(instance.forData(KML_Data, new SourceType(SourceTypeName.GPX)).startsWith(FORMAT_GPX_START)).toBeTrue();
				expect(instance.forData(EWKT_Polygon, new SourceType(SourceTypeName.GPX)).startsWith(FORMAT_GPX_START)).toBeTrue();
				expect(instance.forData(GEOJSON_Data, new SourceType(SourceTypeName.GPX)).startsWith(FORMAT_GPX_START)).toBeTrue();
			});
		});

		describe('KML', () => {
			const FORMAT_KML_START = '<kml ';

			it('requests the kml format reader', () => {
				const instance = setup();
				const formatSpy = spyOn(instance, '_getFormat').and.callThrough();
				spyOn(instance, '_getWriter').and.returnValue(() => 'bar');
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({
					status: SourceTypeResultStatus.OK,
					sourceType: new SourceType(SourceTypeName.KML)
				});

				instance.forData('<kml/>', new SourceType('something'));

				expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.KML);
			});

			it('requests the kml format writer', () => {
				const instance = setup();
				spyOn(instance, '_getReader').and.returnValue(() => []);
				const formatSpy = spyOn(instance, '_getFormat').and.callThrough();
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType('something') });

				instance.forData('someData', new SourceType(SourceTypeName.KML));

				expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.KML);
			});

			it('writes features as kml ', () => {
				const instance = setup();

				spyOn(sourceTypeServiceMock, 'forData')
					.withArgs(GPX_Data)
					.and.returnValues({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.GPX) })
					.withArgs(EWKT_Polygon)
					.and.returnValues({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.EWKT) })
					.withArgs(GEOJSON_Data)
					.and.returnValues({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.GEOJSON) });

				expect(instance.forData(GPX_Data, new SourceType(SourceTypeName.KML)).startsWith(FORMAT_KML_START)).toBeTrue();
				expect(instance.forData(EWKT_Polygon, new SourceType(SourceTypeName.KML)).startsWith(FORMAT_KML_START)).toBeTrue();
				expect(instance.forData(GEOJSON_Data, new SourceType(SourceTypeName.KML)).startsWith(FORMAT_KML_START)).toBeTrue();
			});
		});

		describe('GeoJSON', () => {
			const FORMAT_GEOJSON_START = '{"type":"FeatureCollection","features":[{"type":"Feature"';

			it('requests the geojson format reader', () => {
				const instance = setup();
				const formatSpy = spyOn(instance, '_getFormat').and.callThrough();
				spyOn(instance, '_getWriter').and.returnValue(() => 'bar');
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({
					status: SourceTypeResultStatus.OK,
					sourceType: new SourceType(SourceTypeName.GEOJSON)
				});

				instance.forData('{"type":"FeatureCollection", "features":[]}', new SourceType('something'));

				expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.GEOJSON);
			});

			it('requests the geojson format writer', () => {
				const instance = setup();
				spyOn(instance, '_getReader').and.returnValue(() => []);
				const formatSpy = spyOn(instance, '_getFormat').and.callThrough();
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType('someData') });

				instance.forData('someData', new SourceType(SourceTypeName.GEOJSON));

				expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.GEOJSON);
			});

			it('writes features as geojson ', () => {
				const instance = setup();
				spyOn(sourceTypeServiceMock, 'forData')
					.withArgs(GPX_Data)
					.and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.GPX) })
					.withArgs(EWKT_Polygon)
					.and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.EWKT) })
					.withArgs(KML_Data)
					.and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.KML) });

				expect(instance.forData(GPX_Data, new SourceType(SourceTypeName.GEOJSON)).startsWith(FORMAT_GEOJSON_START)).toBeTrue();
				expect(instance.forData(EWKT_Polygon, new SourceType(SourceTypeName.GEOJSON)).startsWith(FORMAT_GEOJSON_START)).toBeTrue();
				expect(instance.forData(KML_Data, new SourceType(SourceTypeName.GEOJSON)).startsWith(FORMAT_GEOJSON_START)).toBeTrue();
			});
		});

		describe('EWKT', () => {
			const FORMAT_EWKT_START = 'SRID=';

			it('requests the ewkt format reader', () => {
				const instance = setup();
				const readerSpy = spyOn(instance, '_getEwktReader').and.returnValue(() => []);
				spyOn(instance, '_getWriter').and.returnValue(() => 'bar');
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({
					status: SourceTypeResultStatus.OK,
					sourceType: new SourceType(SourceTypeName.EWKT)
				});

				instance.forData('someData', new SourceType('something'));

				expect(readerSpy).toHaveBeenCalled();
			});

			it('requests the ewkt format writer', () => {
				const instance = setup();
				spyOn(instance, '_getReader').and.returnValue(() => []);
				const readerSpy = spyOn(instance, '_getEwktWriter').and.returnValue(() => 'bar');
				spyOn(sourceTypeServiceMock, 'forData').and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType('something') });

				instance.forData('someData', new SourceType(SourceTypeName.EWKT));

				expect(readerSpy).toHaveBeenCalled();
			});

			it('writes features as ewkt ', () => {
				const instance = setup();
				spyOn(sourceTypeServiceMock, 'forData')
					.withArgs(GPX_Data)
					.and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.GPX) })
					.withArgs(GEOJSON_Data)
					.and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.GEOJSON) })
					.withArgs(KML_Data)
					.and.returnValue({ status: SourceTypeResultStatus.OK, sourceType: new SourceType(SourceTypeName.KML) });

				expect(instance.forData(GPX_Data, new SourceType(SourceTypeName.EWKT)).startsWith(FORMAT_EWKT_START)).toBeTrue();
				expect(instance.forData(GEOJSON_Data, new SourceType(SourceTypeName.EWKT)).startsWith(FORMAT_EWKT_START)).toBeTrue();
				expect(instance.forData(KML_Data, new SourceType(SourceTypeName.EWKT)).startsWith(FORMAT_EWKT_START)).toBeTrue();
			});
		});
	});

	describe('_transform', () => {
		it('throws an error when srid is not supported', () => {
			const instance = setup();

			expect(() => {
				instance._transform(['foo'], 4326, 42);
			}).toThrowError('Unsupported SRID: 42');
		});

		it('transforms features', () => {
			const coord4326 = [11.57245, 48.14021];
			const coord3857 = fromLonLat(coord4326);
			const features = [new Feature({ geometry: new Point(coord4326) })];
			const instance = setup();

			const targetFeatures = instance._transform(features, 4326, 3857);

			expect(targetFeatures).toHaveSize(1);
			expect(targetFeatures[0].getGeometry().getCoordinates()[0]).toBeCloseTo(coord3857[0], 3);
			expect(targetFeatures[0].getGeometry().getCoordinates()[1]).toBeCloseTo(coord3857[1], 3);
		});
	});

	describe('_getEwktReader', () => {
		it('reads ewkt data', () => {
			const instance = setup();
			const reader = instance._getEwktReader();

			expect(reader(EWKT_Point).length).toBe(1);
			expect(reader(EWKT_LineString).length).toBe(1);
			expect(reader(EWKT_Polygon).length).toBe(1);
		});

		it('throws a parse error', () => {
			const instance = setup();
			const reader = instance._getEwktReader();

			expect(() => reader('')).toThrowError('Cannot parse data as EWKT');
		});
	});

	describe('_getEwktWriter', () => {
		const point = new Point([10, 10]);
		const lineString = new LineString([
			[10, 10],
			[20, 20],
			[30, 40]
		]);
		const polygon = new Polygon([
			[
				[10, 10],
				[10, 20],
				[20, 20],
				[20, 15],
				[10, 10]
			]
		]);

		it('writes ewkt data', () => {
			const instance = setup();
			const writer = instance._getEwktWriter();

			expect(writer([new Feature({ geometry: point })])).toBe(EWKT_Point);
			expect(writer([new Feature({ geometry: lineString })])).toBe(EWKT_LineString);
			expect(writer([new Feature({ geometry: polygon })])).toBe(EWKT_Polygon);
		});
	});

	describe('_getGpxWriter', () => {
		const point = new Point([10, 10]);
		const lineString = new LineString([
			[10, 10],
			[20, 20],
			[30, 40]
		]);
		const polygon = new Polygon([
			[
				[10, 10],
				[10, 20],
				[20, 20],
				[20, 15],
				[10, 10]
			]
		]);

		it('writes gpx tracks', () => {
			const instance = setup();
			const writer = instance._getGpxWriter();

			expect(writer([new Feature({ geometry: point })])).toBe(
				'<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="OpenLayers"><wpt lat="10" lon="10"/></gpx>'
			);
			expect(writer([new Feature({ geometry: lineString })])).toBe(
				'<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="OpenLayers"><trk><trkseg><trkpt lat="10" lon="10"/><trkpt lat="20" lon="20"/><trkpt lat="40" lon="30"/></trkseg></trk></gpx>'
			);
			expect(writer([new Feature({ geometry: polygon })])).toBe(
				'<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="OpenLayers"><trk><trkseg><trkpt lat="10" lon="10"/><trkpt lat="20" lon="10"/><trkpt lat="20" lon="20"/><trkpt lat="15" lon="20"/><trkpt lat="10" lon="10"/></trkseg></trk></gpx>'
			);
		});

		it('does NOT writes gpx track segments for empty geometries', () => {
			const instance = setup();
			const writer = instance._getGpxWriter();
			const emptyPolygon = new Polygon([[[]]]);
			spyOn(emptyPolygon, 'getLinearRing').and.returnValue(undefined);

			expect(writer([new Feature({ geometry: emptyPolygon })])).toBe(
				'<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="OpenLayers"/>'
			);
		});
	});

	describe('_getFormat', () => {
		it('throws an error when no format found', () => {
			const instance = setup();

			expect(() => {
				instance._getFormat('fooBar');
			}).toThrowError('Format-provider for fooBar is missing.');
		});
	});
});
