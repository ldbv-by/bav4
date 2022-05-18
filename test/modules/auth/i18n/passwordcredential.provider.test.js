import { provide } from '../../../../src/modules/auth/i18n/passwordcredential.provider';


describe('i18n for header module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.auth_passwordCredentialPanel_title).toBe('Authentifizierung für:');
		expect(map.auth_passwordCredentialPanel_credential_username).toBe('Name');
		expect(map.auth_passwordCredentialPanel_credential_password).toBe('Passwort');
		expect(map.auth_passwordCredentialPanel_submit).toBe('verbinden');
		expect(map.auth_passwordCredentialPanel_credential_rejected).toBe('Authentifizierung fehlgeschlagen. Name oder Passwort ungültig!');
		expect(map.auth_passwordCredentialPanel_authenticate).toBe('authentifiziere...');
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.auth_passwordCredentialPanel_title).toBe('authentication for:');
		expect(map.auth_passwordCredentialPanel_credential_username).toBe('Username');
		expect(map.auth_passwordCredentialPanel_credential_password).toBe('Password');
		expect(map.auth_passwordCredentialPanel_submit).toBe('connect');
		expect(map.auth_passwordCredentialPanel_credential_rejected).toBe('Authentication failed. Invalid username or password!');
		expect(map.auth_passwordCredentialPanel_authenticate).toBe('authenticate...');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 6;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {

		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
