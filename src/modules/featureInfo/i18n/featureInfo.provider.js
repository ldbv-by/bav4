export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Close',
				featureInfo_header: 'Object Information',
				featureInfo_info: 'No information available.<br>Please click into the <b>map</b>.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Schließen',
				featureInfo_header: 'Objekt-Info',
				featureInfo_info: 'Keine Informationen verfügbar.<br>Bitte in die <b>Karte</b> klicken.'
			};

		default:
			return {};
	}
};
