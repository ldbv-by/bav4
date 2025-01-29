import { GeometryType } from '../../src/domain/geometryTypes';

describe('GeometryType', () => {
	it('is an enum representing common media types', () => {
		expect(Object.entries(GeometryType).length).toBe(3);
		expect(Object.isFrozen(GeometryType)).toBeTrue();
		expect(GeometryType.POINT).toEqual('Point');
		expect(GeometryType.LINE).toEqual('Line');
		expect(GeometryType.POLYGON).toEqual('Polygon');
	});
});
