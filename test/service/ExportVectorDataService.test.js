import { Feature } from 'ol';
import { VectorGeoResource } from '../../src/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';
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

	const projectionServiceMock = {
		getProjections: () => [4326, 3857]
	};

	const setup = () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('ProjectionService', projectionServiceMock);
		return new OlExportVectorDataService();
	};

	beforeAll(() => {
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
	});

	describe('forGeoResource', () => {
		it('uses forData', async () => {
			const dataSourceType = new SourceType(SourceTypeName.EWKT);
			const targetSourceType = new SourceType(SourceTypeName.GPX);
			const vgr = new VectorGeoResource('id_foo', 'label_foo', dataSourceType);
			vgr.setSource('someData', 4326);
			const instance = setup();

			const forDataSpy = spyOn(instance, 'forData').and.returnValue('someOtherData');

			await expectAsync(instance.forGeoResource(vgr, targetSourceType)).toBeResolvedTo('someOtherData');
			expect(forDataSpy).toHaveBeenCalledWith('someData', dataSourceType, targetSourceType);
		});

		it('throws an error for rejected geoResource.data', async () => {
			const dataSourceType = new SourceType(SourceTypeName.EWKT);
			const targetSourceType = new SourceType(SourceTypeName.GPX);
			const vgr = new VectorGeoResource('id_foo', 'label_foo', dataSourceType);
			spyOnProperty(vgr, 'data', 'get').and.rejectWith(new Error('foo'));

			const instance = setup();

			await expectAsync(instance.forGeoResource(vgr, targetSourceType)).toBeRejectedWithError('foo');
		});

		it('throws an error for empty geoResource.data', async () => {
			const dataSourceType = new SourceType(SourceTypeName.EWKT);
			const targetSourceType = new SourceType(SourceTypeName.GPX);
			const vgr = new VectorGeoResource('id_foo', 'label_foo', dataSourceType);
			vgr.setSource(null, 4326);

			const instance = setup();

			await expectAsync(instance.forGeoResource(vgr, targetSourceType)).toBeRejectedWithError("GeoResource 'id_foo'is empty");
		});
	});

	describe('forData', () => {
		it('returns the data, if no transformation and converting is needed', () => {
			const instance = setup();
			const readerSpy = spyOn(instance, '_getReader').and.callThrough();
			const writerSpy = spyOn(instance, '_getWriter').and.callThrough();
			const transformSpy = spyOn(instance, '_transform').and.callThrough();
			const sameSourceType = new SourceType('same', 1, 42);

			const actual = instance.forData('someData', sameSourceType, sameSourceType);

			expect(actual).toBe('someData');
			expect(readerSpy).not.toHaveBeenCalled();
			expect(writerSpy).not.toHaveBeenCalled();
			expect(transformSpy).not.toHaveBeenCalled();
		});

		it('requests the standard format reader', () => {
			const instance = setup();
			const mockFormat = { readFeatures: () => [] };
			const formatSpy = spyOn(instance, '_getFormat').and.returnValue(mockFormat);
			const readingSpy = spyOn(mockFormat, 'readFeatures');
			spyOn(instance, '_getWriter').and.returnValue(() => 'bar');
			const targetSourceType = new SourceType('something');

			instance.forData('someData', new SourceType(SourceTypeName.KML), targetSourceType);
			expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.KML);
			formatSpy.calls.reset();

			instance.forData('someData', new SourceType(SourceTypeName.GPX), targetSourceType);
			expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.GPX);
			formatSpy.calls.reset();

			instance.forData('someData', new SourceType(SourceTypeName.GEOJSON), targetSourceType);
			expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.GEOJSON);

			expect(readingSpy).toHaveBeenCalledTimes(3); // KML + GPX + GEOJSON
		});

		it('requests the ewkt format reader', () => {
			const instance = setup();

			const readerSpy = spyOn(instance, '_getEwktReader').and.returnValue(() => []);
			spyOn(instance, '_getWriter').and.returnValue(() => 'bar');
			const targetSourceType = new SourceType('something');

			instance.forData('someData', new SourceType(SourceTypeName.EWKT), targetSourceType);
			expect(readerSpy).toHaveBeenCalled();
		});

		it('requests a transformation', () => {
			const instance = setup();

			spyOn(instance, '_getReader').and.returnValue(() => ['foo']);
			const transformSpy = spyOn(instance, '_transform').and.returnValue(() => ['bar']);
			spyOn(instance, '_getWriter').and.returnValue(() => 'baz');

			const dataSourceType = new SourceType('foo', 1, 4326);
			const targetSourceType = new SourceType('bar', 1, 3857);

			instance.forData('someData', dataSourceType, targetSourceType);
			expect(transformSpy).toHaveBeenCalledWith(['foo'], 4326, 3857);
		});

		it('requests the standard format writer', () => {
			const instance = setup();
			spyOn(instance, '_getReader').and.returnValue(() => []);
			const formatSpy = spyOn(instance, '_getFormat').and.callThrough();

			const dataSourceType = new SourceType('something');

			instance.forData('someData', dataSourceType, new SourceType(SourceTypeName.KML));
			expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.KML);
			formatSpy.calls.reset();

			instance.forData('someData', dataSourceType, new SourceType(SourceTypeName.GEOJSON));
			expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.GEOJSON);
		});

		it('requests the ewkt format writer', () => {
			const instance = setup();
			spyOn(instance, '_getReader').and.returnValue(() => []);
			const readerSpy = spyOn(instance, '_getEwktWriter').and.returnValue(() => 'bar');
			const dataSourceType = new SourceType('something');

			instance.forData('someData', dataSourceType, new SourceType(SourceTypeName.EWKT));
			expect(readerSpy).toHaveBeenCalled();
		});

		it('requests the gpx format writer', () => {
			const instance = setup();
			spyOn(instance, '_getReader').and.returnValue(() => []);
			const readerSpy = spyOn(instance, '_getGpxWriter').and.returnValue(() => 'bar');
			const dataSourceType = new SourceType('something');

			instance.forData('someData', dataSourceType, new SourceType(SourceTypeName.GPX));
			expect(readerSpy).toHaveBeenCalled();
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
