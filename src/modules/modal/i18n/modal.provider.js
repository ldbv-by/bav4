export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				modal_close_button: 'Close'
			};

		case 'de':
			return {
				modal_close_button: 'Schließen'
			};

		default:
			return {};
	}
};
