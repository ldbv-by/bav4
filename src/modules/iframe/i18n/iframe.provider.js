export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'The BayernAtlas Iframe API must be used in an iframe.',
				iframe_generator_width: 'Width',
				iframe_generator_height: 'Height',
				iframe_copy_icon: 'Copy to clipboard',
				iframe_embed_clipboard_success: 'The HTML code was copied to clipboard',
				iframe_generator_toggle: 'Auto Width'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'Die BayernAtlas Iframe API muss über ein Inlineframe-Element eingebunden werden.',
				iframe_generator_width: 'Breite',
				iframe_generator_height: 'Höhe',
				iframe_copy_icon: 'In die Zwischenablage kopieren',
				iframe_embed_clipboard_success: 'Der HTML-code wurde in die Zwischenablage kopiert',
				iframe_generator_toggle: 'Auto Width'
			};

		default:
			return {};
	}
};
