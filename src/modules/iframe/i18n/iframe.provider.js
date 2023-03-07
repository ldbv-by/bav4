export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'The BayernAtlas Iframe API must be used in an iframe.',
				iframe_generator_width: 'Width',
				iframe_generator_height: 'Height',
				iframe_embed_clipboard_success: 'The HTML code was copied to the clipboard',
				iframe_embed_clipboard_error: '"Copy to clipboard" is not available',
				iframe_generator_toggle_label: 'Auto-adjustment width',
				iframe_generator_toggle_title: 'Embedded map will expand to fit the width of its container.',
				iframe_copy_icon: 'Copy to clipboard'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'Die BayernAtlas Iframe API muss über ein Inlineframe-Element eingebunden werden.',
				iframe_generator_width: 'Breite',
				iframe_generator_height: 'Höhe',
				iframe_embed_clipboard_success: 'Der HTML Code wurde in die Zwischenablage kopiert',
				iframe_embed_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				iframe_generator_toggle_label: 'Auto-Anpassungsbreite',
				iframe_generator_toggle_title: 'Eingebettete Karte wird sich erweitern, um sich der Breite seines Containers anzupassen.',
				iframe_copy_icon: 'In die Zwischenablage kopieren'
			};

		default:
			return {};
	}
};
