import { $injector } from '../../../../src/injection';
import { SlopeType } from '../../../../src/modules/altitudeProfile/utils/altitudeProfileUtils';

$injector.registerSingleton('TranslationService', { translate: (key) => key });

describe('Unit test functions altitudeProfileUtils.js', () => {
	describe('check SlopeType', () => {
		const slopeType = SlopeType.Flat;

		it('check SlopeType length', () => {
			expect(Object.keys(slopeType).length).toBe(4);
		});

		it('check SlopeType possible values', () => {
			expect(SlopeType.Flat).toBe('Flat');
			expect(SlopeType.Steep).toBe('Steep');
		});
	});
});
