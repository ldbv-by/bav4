export const privacyPolicyProvider = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				footer_privacy_policy_link: 'Privacy Policy'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				footer_privacy_policy_link: 'Datenschutzerklärung'
			};

		default:
			return {};
	}
};
