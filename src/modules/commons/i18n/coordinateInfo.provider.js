export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				common_coordinateInfo_copy_icon: 'Copy to clipboard',
				common_coordinateInfo_clipboard_error: '"Copy to clipboard" is not available',
				common_coordinateInfo_clipboard_success: 'was copied to clipboard'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				common_coordinateInfo_copy_icon: 'In die Zwischenablage kopieren',
				common_coordinateInfo_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				common_coordinateInfo_clipboard_success: 'wurde in die Zwischenablage kopiert'
			};

		default:
			return {};
	}
};
