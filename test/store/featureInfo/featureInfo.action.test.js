import { FeatureInfoGeometryTypes } from '../../../src/store/featureInfo/featureInfo.action';

describe('featureInfoAction', () => {
	it('exports a enum for FeatureInfoGeometryTypes', () => {
		expect(Object.keys(FeatureInfoGeometryTypes).length).toBe(1);
		expect(FeatureInfoGeometryTypes.GEOJSON).toBe(0);
	});
});
