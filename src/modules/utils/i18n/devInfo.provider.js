export const provide = (lang) => {
	switch (lang) {
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				devInfo_copy_to_clipboard_title: 'Build Informationen in die Zwischenablage kopieren',
				devInfo_copy_to_clipboard_success: 'Build Informationen wurden in die Zwischenablage kopiert',
				devInfo_copy_to_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				devInfo_open_showcase_modal: 'Showcase öffnen'
			};

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				devInfo_copy_to_clipboard_title: 'Copy build information to clipboard',
				devInfo_copy_to_clipboard_success: 'Build information has been copied to the clipboard',
				devInfo_copy_to_clipboard_error: '"Copy to clipboard" is not available',
				devInfo_open_showcase_modal: 'open showcase'
			};

		default:
			return {};
	}
};
