export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				info_coordinateInfo_copy_icon: 'Copy to clipboard',
				info_coordinateInfo_clipboard_error: '"Copy to clipboard" is not available',
				info_coordinateInfo_clipboard_success: 'was copied to clipboard',
				info_coordinateInfo_elevation_label: 'Elev. (m)'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				info_coordinateInfo_copy_icon: 'In die Zwischenablage kopieren',
				info_coordinateInfo_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				info_coordinateInfo_clipboard_success: 'wurde in die Zwischenablage kopiert',
				info_coordinateInfo_elevation_label: 'Höhe (m)'
			};

		default:
			return {};
	}
};
