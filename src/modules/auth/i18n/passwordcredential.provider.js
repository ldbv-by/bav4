import { html } from '../../../../node_modules/lit-html/lit-html';

export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_passwordCredentialPanel_title: 'Authentication is required for this service:',
				auth_passwordCredentialPanel_credential_username: 'Username',
				auth_passwordCredentialPanel_credential_password: 'Password',
				auth_passwordCredentialPanel_submit: 'Submit',
				auth_passwordCredentialPanel_submit_title: 'Submit authentication info',
				auth_passwordCredentialPanel_credential_failed: 'Sign in failed. Invalid username or password!',
				auth_passwordCredentialPanel_credential_rejected: 'Sign in failed. Something got wrong!',
				auth_passwordCredentialPanel_authenticate: 'Authenticating...',
				auth_passwordCredentialPanel_footer_register_for_role: (params) => html`Not yet a registered ${params[0]} customer?`,
				auth_passwordCredentialPanel_footer_register_information: (params) =>
					html`You can find more <a target="_blank" href="${params[0]}">information</a> here.`,
				auth_passwordCredentialPanel_footer_forgot_login: 'Forgot username?',
				auth_passwordCredentialPanel_footer_forgot_password: 'Forgot password?'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_passwordCredentialPanel_title: 'Dienst erfordert eine Authentifizierung:',
				auth_passwordCredentialPanel_credential_username: 'Kennung',
				auth_passwordCredentialPanel_credential_password: 'Passwort',
				auth_passwordCredentialPanel_submit: 'Senden',
				auth_passwordCredentialPanel_submit_title: 'Anmeldeinformationen senden',
				auth_passwordCredentialPanel_credential_failed: 'Anmeldung fehlgeschlagen. Kennung oder Passwort ungültig!',
				auth_passwordCredentialPanel_credential_rejected: 'Anmeldung fehlgeschlagen. Es ist ein technisches Problem aufgetreten!',
				auth_passwordCredentialPanel_authenticate: 'Anmeldung läuft...',
				auth_passwordCredentialPanel_footer_register_for_role: (params) => html`Noch kein registrierter ${params[0]} Kunde?`,
				auth_passwordCredentialPanel_footer_register_information: (params) =>
					html`Hier finden Sie weitere <a target="_blank" href="${params[0]}">Informationen</a>.`,
				auth_passwordCredentialPanel_footer_forgot_login: 'Kennung vergessen?',
				auth_passwordCredentialPanel_footer_forgot_password: 'Passwort vergessen?'
			};

		default:
			return {};
	}
};
