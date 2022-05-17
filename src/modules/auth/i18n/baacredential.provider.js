export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_baaCredentialPanel_title: 'authentication for:',
				auth_baaCredentialPanel_credential_username: 'Username',
				auth_baaCredentialPanel_credential_password: 'Password',
				auth_baaCredentialPanel_submit: 'connect',
				auth_baaCredentialPanel_credential_rejected: 'Authentication failed. Invalid username or password!',
				auth_baaCredentialPanel_authenticate: 'authenticate...'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_baaCredentialPanel_title: 'Authentifizierung für:',
				auth_baaCredentialPanel_credential_username: 'Name',
				auth_baaCredentialPanel_credential_password: 'Passwort',
				auth_baaCredentialPanel_submit: 'verbinden',
				auth_baaCredentialPanel_credential_rejected: 'Authentifizierung fehlgeschlagen. Name oder Passwort ungültig!',
				auth_baaCredentialPanel_authenticate: 'authentifiziere...'
			};

		default:
			return {};
	}
};
