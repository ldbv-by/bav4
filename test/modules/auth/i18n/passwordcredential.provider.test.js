import { provide } from '../../../../src/modules/auth/i18n/passwordcredential.provider';

describe('i18n for header module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.auth_passwordCredentialPanel_title).toBe('Authentifizierung für:');
		expect(map.auth_passwordCredentialPanel_credential_username).toBe('Name');
		expect(map.auth_passwordCredentialPanel_credential_password).toBe('Passwort');
		expect(map.auth_passwordCredentialPanel_submit).toBe('Senden');
		expect(map.auth_passwordCredentialPanel_credential_failed).toBe('Authentifizierung fehlgeschlagen. Name oder Passwort ungültig!');
		expect(map.auth_passwordCredentialPanel_credential_rejected).toBe(
			'Authentifizierung fehlgeschlagen. Es ist ein technisches Problem aufgetreten!'
		);
		expect(map.auth_passwordCredentialPanel_authenticate).toBe('Authentifiziere');
		expect(map.auth_passwordCredentialPanel_footer_register_for_role_prefix).toBe('Noch kein registrierter ');
		expect(map.auth_passwordCredentialPanel_footer_register_for_role_suffix).toBe('Kunde?');
		expect(map.auth_passwordCredentialPanel_footer_register_information_prefix).toBe('Hier finden Sie weitere');
		expect(map.auth_passwordCredentialPanel_footer_register_information).toBe('Informationen');
		expect(map.auth_passwordCredentialPanel_footer_register_information_suffix).toBe('.');
		expect(map.auth_passwordCredentialPanel_footer_forgot_login).toBe('Kennung vergessen?');
		expect(map.auth_passwordCredentialPanel_footer_forgot_password).toBe('Password vergessen?');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.auth_passwordCredentialPanel_title).toBe('Authentication for:');
		expect(map.auth_passwordCredentialPanel_credential_username).toBe('Username');
		expect(map.auth_passwordCredentialPanel_credential_password).toBe('Password');
		expect(map.auth_passwordCredentialPanel_submit).toBe('Submit');
		expect(map.auth_passwordCredentialPanel_credential_failed).toBe('Authentication failed. Invalid username or password!');
		expect(map.auth_passwordCredentialPanel_credential_rejected).toBe('Authentication failed. Something got wrong!');
		expect(map.auth_passwordCredentialPanel_authenticate).toBe('Authenticating');
		expect(map.auth_passwordCredentialPanel_footer_register_for_role_prefix).toBe('Not yet a registered ');
		expect(map.auth_passwordCredentialPanel_footer_register_for_role_suffix).toBe('customer?');
		expect(map.auth_passwordCredentialPanel_footer_register_information_prefix).toBe('You can find more');
		expect(map.auth_passwordCredentialPanel_footer_register_information).toBe('information');
		expect(map.auth_passwordCredentialPanel_footer_register_information_suffix).toBe(' here.');
		expect(map.auth_passwordCredentialPanel_footer_forgot_login).toBe('Forgot username?');
		expect(map.auth_passwordCredentialPanel_footer_forgot_password).toBe('Forgot password?');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 14;
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
