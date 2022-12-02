import { $injector } from '../../../../src/injection';
import { InclineType } from '../../../../src/modules/altitudeProfile/utils/AltitudeProfileUtils';

$injector.registerSingleton('TranslationService', { translate: (key) => key });

describe('Unit test functions AltitudeProfileUtils.js', () => {
	describe('check InclineType', () => {
		const inclineType = InclineType.Flat;

		it('check InclineType length', () => {
			expect(Object.keys(inclineType).length).toBe(4);
		});

		it('check InclineType possible values', () => {
			expect(InclineType.Flat).toBe('Flat');
			expect(InclineType.Steep).toBe('Steep');
		});
	});
});
