export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_contextMenu_header: 'Location',
				map_contextMenu_close_button: 'Close',
				map_contextMenuContent_altitude_label: 'Alt.',
				map_contextMenuContent_community_label: 'Community',
				map_contextMenuContent_district_label: 'District',
				map_contextMenuContent_copy_icon: 'Copy to clipboard',
				map_contextMenuContent_clipboard_error: '"Copy to clipboard" is not available',
				map_contextMenuContent_clipboard_success: 'was copied to clipboard',
				map_contextMenuContent_clipboard_link_text: 'The link',
				map_contextMenuContent_clipboard_measure_area: 'The area',
				map_contextMenuContent_clipboard_measure_distance: 'The distance'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_contextMenu_header: 'Position',
				map_contextMenu_close_button: 'Schließen',
				map_contextMenuContent_altitude_label: 'Höhe',
				map_contextMenuContent_community_label: 'Gemeinde',
				map_contextMenuContent_district_label: 'Gemarkung',
				map_contextMenuContent_copy_icon: 'In die Zwischenablage kopieren',
				map_contextMenuContent_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				map_contextMenuContent_clipboard_success: 'wurde in die Zwischenablage kopiert',
				map_contextMenuContent_clipboard_link_text: 'Der Link',
				map_contextMenuContent_clipboard_measure_area: 'Die Fläche',
				map_contextMenuContent_clipboard_measure_distance: 'Die Länge'
			};

		default:
			return {};
	}
};
