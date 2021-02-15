import { defaultStringifyFunction } from '../../../src/services/provider/stringifyCoords.provider';

describe('StringifyCoord provider', () => {

	describe('default provider', () => {

		it('it registers Bvv specific definitions', () => {

			const initialCooord4326 = [11.57245, 48.14021];

			const string = defaultStringifyFunction()(initialCooord4326, { digits: 3 });

			expect(string).toBe('11.572, 48.140');
		});
	});
});