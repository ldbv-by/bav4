import { provide } from '../../../../src/modules/auth/i18n/passwordcredential.provider';
import { TestUtils } from '../../../test-utils';

describe('i18n for header module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.auth_passwordCredentialPanel_title).toBe('Anmelden für:');
		expect(map.auth_passwordCredentialPanel_credential_username).toBe('Name');
		expect(map.auth_passwordCredentialPanel_credential_password).toBe('Passwort');
		expect(map.auth_passwordCredentialPanel_submit).toBe('Senden');
		expect(map.auth_passwordCredentialPanel_credential_failed).toBe('Anmeldung fehlgeschlagen. Name oder Passwort ungültig!');
		expect(map.auth_passwordCredentialPanel_credential_rejected).toBe('Anmeldung fehlgeschlagen. Es ist ein technisches Problem aufgetreten!');
		expect(map.auth_passwordCredentialPanel_authenticate).toBe('Anmeldung läuft...');
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_for_role(['foo'])).textContent).toBe(
			'Noch kein registrierter foo Kunde?'
		);
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_information(['bar'])).textContent).toBe(
			'Hier finden Sie weitere Informationen.'
		);
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_information(['bar'])).querySelector('a').href).toContain(
			'bar'
		);
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_information(['bar'])).querySelector('a').target).toBe(
			'_blank'
		);
		expect(map.auth_passwordCredentialPanel_footer_forgot_login).toBe('Kennung vergessen?');
		expect(map.auth_passwordCredentialPanel_footer_forgot_password).toBe('Passwort vergessen?');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.auth_passwordCredentialPanel_title).toBe('Authentication for:');
		expect(map.auth_passwordCredentialPanel_credential_username).toBe('Username');
		expect(map.auth_passwordCredentialPanel_credential_password).toBe('Password');
		expect(map.auth_passwordCredentialPanel_submit).toBe('Submit');
		expect(map.auth_passwordCredentialPanel_credential_failed).toBe('Sign in failed. Invalid username or password!');
		expect(map.auth_passwordCredentialPanel_credential_rejected).toBe('Sign in failed. Something got wrong!');
		expect(map.auth_passwordCredentialPanel_authenticate).toBe('Authenticating...');
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_for_role(['foo'])).textContent).toBe(
			'Not yet a registered foo customer?'
		);
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_information(['bar'])).textContent).toBe(
			'You can find more information here.'
		);
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_information(['bar'])).querySelector('a').href).toContain(
			'bar'
		);
		expect(TestUtils.renderTemplateResult(map.auth_passwordCredentialPanel_footer_register_information(['bar'])).querySelector('a').target).toBe(
			'_blank'
		);
		expect(map.auth_passwordCredentialPanel_footer_forgot_login).toBe('Forgot username?');
		expect(map.auth_passwordCredentialPanel_footer_forgot_password).toBe('Forgot password?');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 11;
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
