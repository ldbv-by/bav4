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
				auth_passwordCredentialPanel_authenticate: 'Authenticating',
				auth_passwordCredentialPanel_footer_register_for_role_prefix: 'Not yet a registered ',
				auth_passwordCredentialPanel_footer_register_for_role_suffix: 'customer?',
				auth_passwordCredentialPanel_footer_register_information_prefix: 'You can find more',
				auth_passwordCredentialPanel_footer_register_information: 'information',
				auth_passwordCredentialPanel_footer_register_information_suffix: ' here.',
				auth_passwordCredentialPanel_footer_forgot_login: 'Forgot username?',
				auth_passwordCredentialPanel_footer_forgot_password: 'Forgot password?'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				auth_passwordCredentialPanel_title: 'Authentifizierung für:',
				auth_passwordCredentialPanel_credential_username: 'Name',
				auth_passwordCredentialPanel_credential_password: 'Passwort',
				auth_passwordCredentialPanel_submit: 'Senden',
				auth_passwordCredentialPanel_credential_failed: 'Authentifizierung fehlgeschlagen. Name oder Passwort ungültig!',
				auth_passwordCredentialPanel_credential_rejected: 'Authentifizierung fehlgeschlagen. Es ist ein technisches Problem aufgetreten!',
				auth_passwordCredentialPanel_authenticate: 'Authentifiziere',
				auth_passwordCredentialPanel_footer_register_for_role_prefix: 'Noch kein registrierter ',
				auth_passwordCredentialPanel_footer_register_for_role_suffix: 'Kunde?',
				auth_passwordCredentialPanel_footer_register_information_prefix: 'Hier finden Sie weitere',
				auth_passwordCredentialPanel_footer_register_information: 'Informationen',
				auth_passwordCredentialPanel_footer_register_information_suffix: '.',
				auth_passwordCredentialPanel_footer_forgot_login: 'Kennung vergessen?',
				auth_passwordCredentialPanel_footer_forgot_password: 'Password vergessen?'
			};

		default:
			return {};
	}
};
