export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'The BayernAtlas Iframe API must be used in an iframe.',
				iframe_embed_disclaimer_title: 'Disclaimer',
				iframe_embed_disclaimer_text: 'You can embed the map in your website or blog. By embedding this map you agree to the terms of use.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'Die BayernAtlas Iframe API muss über ein Inlineframe-Element eingebunden werden.',
				iframe_embed_disclaimer_title: 'Nutzungsbedingungen',
				iframe_embed_disclaimer_text: 'Sie können die Karte in Ihre Website oder ein Blog einbetten. Mit dem Einbetten dieser Karte stimmen Sie den Nutzungsbedingungen zu.'
			};

		default:
			return {};
	}
};
