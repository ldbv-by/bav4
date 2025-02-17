import { GeometryType } from '../../src/domain/geometryTypes';

describe('GeometryType', () => {
	it('is an enum representing common geometry types', () => {
		expect(Object.entries(GeometryType).length).toBe(4);
		expect(Object.isFrozen(GeometryType)).toBeTrue();
		expect(GeometryType.POINT).toEqual('Point');
		expect(GeometryType.LINE).toEqual('Line');
		expect(GeometryType.POLYGON).toEqual('Polygon');
		expect(GeometryType.COLLECTION).toEqual('Collection');
	});
});
