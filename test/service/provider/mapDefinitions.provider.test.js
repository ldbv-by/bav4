import { getBvvMapDefinitions } from '../../../src/services/provider/mapDefinitions.provider';

describe('MapDefinitions provider', () => {

	describe('Bvv mapDefinitions provider', () => {

		it('provides map related meta data', () => {
			const { defaultExtent, srid, defaultSridForView, sridsForView, defaultGeodeticSrid } = getBvvMapDefinitions();

			expect(defaultExtent).toEqual([995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462]);
			expect(srid).toBe(3857);
			expect(defaultSridForView).toBe(25832);
			expect(sridsForView).toEqual([25832, 4326]);
			expect(defaultGeodeticSrid).toEqual(25832);
		});
	});
});