import { VectorGeoResource } from '../../src/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';
import { OlExportVectorDataService } from '../../src/services/ExportVectorDataService';
import { TestUtils } from '../test-utils';

describe('ExportVectorDataService', () => {
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

		const EWKT_Point = 'SRID=4326;Point(10 10)';
		const EWKT_LineString = 'SRID=4326;LineString(10 10, 20 20, 30 40)';
		const EWKT_Polygon = 'SRID=4326;Polygon((10 10, 10 20, 20 20, 20 15, 10 10))';

		const Empty_GPX =
			'<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="OpenLayers"/>';
		describe('having EWKT data', () => {
			it('exports to GPX', () => {
				const instance = setup();
				const dataSourceType = new SourceType(SourceTypeName.EWKT);
				const targetSourceType = new SourceType(SourceTypeName.GPX);

				expect(instance.forData(EWKT_Point, dataSourceType, targetSourceType)).toContain('<wpt lat="10" lon="10"/>');
				expect(instance.forData(EWKT_LineString, dataSourceType, targetSourceType)).toContain(
					'<rte><rtept lat="10" lon="10"/><rtept lat="20" lon="20"/><rtept lat="40" lon="30"/></rte>'
				);
				expect(instance.forData(EWKT_Polygon, dataSourceType, targetSourceType)).toBe(Empty_GPX);
			});
		});
	});
});
