import { SourceType, SourceTypeMaxFileSize, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../src/domain/sourceType';

describe('SourceType', () => {
	it('provides getter for properties', () => {
		const sourceType = new SourceType('name', 'version', 42);

		expect(sourceType.name).toBe('name');
		expect(sourceType.version).toBe('version');
		expect(sourceType.srid).toEqual(42);
	});

	it('provides default properties', () => {
		const sourceType = new SourceType('name', undefined);

		expect(sourceType.name).toBe('name');
		expect(sourceType.version).toBeNull();
		expect(sourceType.srid).toBeNull();
	});

	it('provides static convenience methods', () => {
		expect(SourceType.forKml()).toEqual(new SourceType(SourceTypeName.KML, null, 4326));
		expect(SourceType.forGpx()).toEqual(new SourceType(SourceTypeName.GPX, null, 4326));
		expect(SourceType.forGeoJSON()).toEqual(new SourceType(SourceTypeName.GEOJSON, null, 4326));
		expect(SourceType.forEwkt(12345)).toEqual(new SourceType(SourceTypeName.EWKT, null, 12345));
	});
});

describe('SourceTypeResult', () => {
	it('provides getter for properties', () => {
		const sourceType = new SourceType('name', 'version');
		const result = new SourceTypeResult(SourceTypeResultStatus.OK, sourceType);

		expect(result.status).toEqual(SourceTypeResultStatus.OK);
		expect(result.sourceType).toBe(sourceType);
	});

	it('provides default properties', () => {
		const result = new SourceTypeResult(SourceTypeResultStatus.MAX_SIZE_EXCEEDED, undefined);

		expect(result.status).toEqual(SourceTypeResultStatus.MAX_SIZE_EXCEEDED);
		expect(result.sourceType).toBeNull();
	});
});

describe('SourceTypeName', () => {
	it('provides an enum of all available types', () => {
		expect(Object.keys(SourceTypeName).length).toBe(6);
		expect(Object.isFrozen(SourceTypeName)).toBeTrue();
		expect(SourceTypeName.KML).toBe('kml');
		expect(SourceTypeName.GPX).toBe('gpx');
		expect(SourceTypeName.GEOJSON).toBe('geojson');
		expect(SourceTypeName.EWKT).toBe('ewkt');
		expect(SourceTypeName.OAF).toBe('oaf');
		expect(SourceTypeName.WMS).toBe('wms');
	});
});

describe('SourceTypeResultStatus', () => {
	it('provides an enum of all available types', () => {
		expect(Object.keys(SourceTypeResultStatus).length).toBe(7);
		expect(Object.isFrozen(SourceTypeResultStatus)).toBeTrue();
		expect(SourceTypeResultStatus.OK).toBe(0);
		expect(SourceTypeResultStatus.UNSUPPORTED_TYPE).toBe(1);
		expect(SourceTypeResultStatus.MAX_SIZE_EXCEEDED).toBe(2);
		expect(SourceTypeResultStatus.OTHER).toBe(3);
		expect(SourceTypeResultStatus.BAA_AUTHENTICATED).toBe(4);
		expect(SourceTypeResultStatus.RESTRICTED).toBe(5);
		expect(SourceTypeResultStatus.UNSUPPORTED_SRID).toBe(6);
	});
});

describe('SourceTypeMaxFileSize', () => {
	it('provides a maximum file size', () => {
		expect(SourceTypeMaxFileSize).toBe(134217728);
	});
});
