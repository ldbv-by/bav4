export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				elevationProfile_distance: 'Distance',
				elevationProfile_incline: 'Incline',
				elevationProfile_sumUp: 'SumUp',
				elevationProfile_sumDown: 'SumDown',
				elevationProfile_elevation: 'Elevation'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				elevationProfile_distance: 'Entfernung',
				elevationProfile_incline: 'Steigung',
				elevationProfile_sumUp: 'SumUp de',
				elevationProfile_sumDown: 'SumDown de',
				elevationProfile_elevation: 'Höhe'
			};

		default:
			return {};
	}
};
