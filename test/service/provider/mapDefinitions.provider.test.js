import { getBvvMapDefinitions } from '../../../src/services/provider/mapDefinitions.provider';

describe('MapDefinitions provider', () => {

	describe('Bvv mapDefinitions provider', () => {

		it('it maps vectorSourceType to olFormats', () => {
			const { defaultExtent } = getBvvMapDefinitions();

			expect(defaultExtent).toEqual([995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462]);
		});
	});
});