import { FeatureInfoGeometryTypes } from '../../src/domain/featureInfo';

describe('featureInfoAction', () => {
	it('exports a enum for FeatureInfoGeometryTypes', () => {
		expect(Object.keys(FeatureInfoGeometryTypes).length).toBe(1);
		expect(FeatureInfoGeometryTypes.GEOJSON).toBe(0);
	});
});
