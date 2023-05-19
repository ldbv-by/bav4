import { Feature } from 'ol';
import { VectorGeoResource } from '../../src/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';
import { OlExportVectorDataService } from '../../src/services/ExportVectorDataService';
import { TestUtils } from '../test-utils';
import { Point, LineString, Polygon } from 'ol/geom';

describe('ExportVectorDataService', () => {
	const EWKT_Point = 'SRID=4326;POINT(10 10)';
	const EWKT_LineString = 'SRID=4326;LINESTRING(10 10,20 20,30 40)';
	const EWKT_Polygon = 'SRID=4326;POLYGON((10 10,10 20,20 20,20 15,10 10))';
	const setup = () => {
		TestUtils.setupStoreAndDi({});

		return new OlExportVectorDataService();
	};

	describe('forGeoResource', () => {
		it('uses forData', () => {
			const dataSourceType = new SourceType(SourceTypeName.EWKT);
			const targetSourceType = new SourceType(SourceTypeName.GPX);
			const vgr = new VectorGeoResource('id_foo', 'label_foo', dataSourceType);
			vgr.setSource('someData', 4326);
			const instance = setup();

			const forDataSpy = spyOn(instance, 'forData').and.returnValue('someOtherData');

			expect(instance.forGeoResource(vgr, targetSourceType)).toBe('someOtherData');
			expect(forDataSpy).toHaveBeenCalledWith('someData', dataSourceType, targetSourceType);
		});
	});

	describe('forData', () => {
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

		it('requests the standard format writer', () => {
			const instance = setup();
			spyOn(instance, '_getReader').and.returnValue(() => []);
			const formatSpy = spyOn(instance, '_getFormat').and.callThrough();

			const dataSourceType = new SourceType('something');

			instance.forData('someData', dataSourceType, new SourceType(SourceTypeName.KML));
			expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.KML);
			formatSpy.calls.reset();

			instance.forData('someData', dataSourceType, new SourceType(SourceTypeName.GPX));
			expect(formatSpy).toHaveBeenCalledWith(SourceTypeName.GPX);
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
	});

	describe('_getEwktReader', () => {
		it('reads ewkt data', () => {
			const instance = setup();
			const reader = instance._getEwktReader();

			expect(reader(EWKT_Point).length).toBe(1);
			expect(reader(EWKT_LineString).length).toBe(1);
			expect(reader(EWKT_Polygon).length).toBe(1);
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

	describe('_getFormat', () => {
		it('throws an error when no format found', () => {
			const instance = setup();

			expect(() => {
				instance._getFormat('fooBar');
			}).toThrowError('Format-provider for fooBar is missing.');
		});
	});
});
