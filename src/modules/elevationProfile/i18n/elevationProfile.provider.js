export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				elevationProfile_distance: 'Distance',
				elevationProfile_slope: 'Slope',
				elevationProfile_sumUp: 'Ascent',
				elevationProfile_sumDown: 'Descent',
				elevationProfile_alt: 'Elevation',
				elevationProfile_surface: 'Surface',
				elevationProfile_elevation_profile: 'Elevation Profile',
				elevationProfile_verticalHeight: 'Elevation difference start - end',
				elevationProfile_highestPoint: 'Highest point',
				elevationProfile_lowestPoint: 'Lowest point',
				elevationProfile_linearDistance: 'Linear distance',
				elevationProfile_could_not_load: 'Elevation Profile could not be loaded',
				elevationProfile_unknown: 'unknown'
			};

		case 'de':
			return {
				elevationProfile_distance: 'Entfernung',
				elevationProfile_slope: 'Steigung',
				elevationProfile_sumUp: 'Aufstieg',
				elevationProfile_sumDown: 'Abstieg',
				elevationProfile_alt: 'Höhe',
				elevationProfile_surface: 'Untergrund',
				elevationProfile_elevation_profile: 'Höhenprofil',
				elevationProfile_verticalHeight: 'Höhendifferenz Start - Ende',
				elevationProfile_highestPoint: 'Höchster Punkt',
				elevationProfile_lowestPoint: 'Tiefster Punkt',
				elevationProfile_linearDistance: 'Luftlinie',
				elevationProfile_could_not_load: 'Das Höhenprofil konnte nicht geladen werden',
				elevationProfile_unknown: 'unbekannt'
			};

		default:
			return {};
	}
};
