export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				modal_close_button: 'Close',
				modal_close_button_title: 'Close modal'
			};

		case 'de':
			return {
				modal_close_button: 'Schließen',
				modal_close_button_title: 'Fenster schließen'
			};

		default:
			return {};
	}
};
