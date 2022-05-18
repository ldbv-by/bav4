export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_passwordCredentialPanel_title: 'authentication for:',
				auth_passwordCredentialPanel_credential_username: 'Username',
				auth_passwordCredentialPanel_credential_password: 'Password',
				auth_passwordCredentialPanel_submit: 'connect',
				auth_passwordCredentialPanel_credential_rejected: 'Authentication failed. Invalid username or password!',
				auth_passwordCredentialPanel_authenticate: 'authenticate...'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_passwordCredentialPanel_title: 'Authentifizierung für:',
				auth_passwordCredentialPanel_credential_username: 'Name',
				auth_passwordCredentialPanel_credential_password: 'Passwort',
				auth_passwordCredentialPanel_submit: 'verbinden',
				auth_passwordCredentialPanel_credential_rejected: 'Authentifizierung fehlgeschlagen. Name oder Passwort ungültig!',
				auth_passwordCredentialPanel_authenticate: 'authentifiziere...'
			};

		default:
			return {};
	}
};
