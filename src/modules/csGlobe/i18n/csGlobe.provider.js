import { html } from 'lit-html';

export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module				
				csGlobe_map: 'Interactive map'

			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				csGlobe_map: 'Interaktive Karte'
			};

		default:
			return {};
	}
};
