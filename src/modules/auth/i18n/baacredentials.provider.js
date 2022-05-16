export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_baaCredentialsPanel_title: 'authentication for:',
				auth_baaCredentialsPanel_credentials_username: 'Username',
				auth_baaCredentialsPanel_credentials_password: 'Password',
				auth_baaCredentialsPanel_submit: 'connect',
				auth_baaCredentialsPanel_credentials_rejected: 'Authentication failed. Invalid username or password!',
				auth_baaCredentialsPanel_authenticate: 'authenticate...'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_baaCredentialsPanel_title: 'Authentifizierung für:',
				auth_baaCredentialsPanel_credentials_username: 'Name',
				auth_baaCredentialsPanel_credentials_password: 'Passwort',
				auth_baaCredentialsPanel_submit: 'verbinden',
				auth_baaCredentialsPanel_credentials_rejected: 'Authentifizierung fehlgeschlagen. Name oder Passwort ungültig!',
				auth_baaCredentialsPanel_authenticate: 'authentifiziere...'
			};

		default:
			return {};
	}
};
