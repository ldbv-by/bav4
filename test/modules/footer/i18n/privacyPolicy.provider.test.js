import { privacyPolicyProvider } from '../../../../src/modules/footer/i18n/privacyPolicy.provider';

describe('i18n for coordinate select', () => {
	it('provides translation for en', () => {
		const map = privacyPolicyProvider('en');

		expect(map.footer_privacy_policy_link).toBe('Privacy Policy');
	});

	it('provides translation for de', () => {
		const map = privacyPolicyProvider('de');

		expect(map.footer_privacy_policy_link).toBe('Datenschutzerklärung');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 1;
		const deMap = privacyPolicyProvider('de');
		const enMap = privacyPolicyProvider('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = privacyPolicyProvider('unknown');

		expect(map).toEqual({});
	});
});
