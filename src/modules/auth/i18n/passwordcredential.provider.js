export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_passwordCredentialPanel_title: 'Authentication for:',
				auth_passwordCredentialPanel_credential_username: 'Username',
				auth_passwordCredentialPanel_credential_password: 'Password',
				auth_passwordCredentialPanel_submit: 'Submit',
				auth_passwordCredentialPanel_credential_failed: 'Authentication failed. Invalid username or password!',
				auth_passwordCredentialPanel_credential_rejected: 'Authentication failed. Something got wrong!',
				auth_passwordCredentialPanel_authenticate: 'Authenticating...'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_passwordCredentialPanel_title: 'Anmelden für:',
				auth_passwordCredentialPanel_credential_username: 'Name',
				auth_passwordCredentialPanel_credential_password: 'Passwort',
				auth_passwordCredentialPanel_submit: 'Senden',
				auth_passwordCredentialPanel_credential_failed: 'Anmeldung fehlgeschlagen. Name oder Passwort ungültig!',
				auth_passwordCredentialPanel_credential_rejected: 'Anmeldung fehlgeschlagen. Es ist ein technisches Problem aufgetreten!',
				auth_passwordCredentialPanel_authenticate: 'Anmeldung läuft...'
			};

		default:
			return {};
	}
};
