export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				elevationProfile_distance: 'Distance',
				elevationProfile_slope: 'Slope',
				elevationProfile_sumUp: 'Ascent',
				elevationProfile_sumDown: 'Descent',
				elevationProfile_alt: 'Elevation',
				elevationProfile_surface: 'surface',
				elevationProfile_elevation_profile: 'Elevation Profile',
				elevationProfile_verticalHeight: 'Vertical Height',
				elevationProfile_highestPoint: 'Highest Point',
				elevationProfile_lowestPoint: 'Lowest Point',
				elevationProfile_linearDistance: 'Linear Distance',
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
				elevationProfile_verticalHeight: 'Höhe',
				elevationProfile_highestPoint: 'Höchster Punkt',
				elevationProfile_lowestPoint: 'Tiefster Punkt',
				elevationProfile_linearDistance: 'Strecke',
				elevationProfile_could_not_load: 'Höhenprofil konnte nicht geladen werden',
				elevationProfile_unknown: 'unbekannt'
			};

		default:
			return {};
	}
};
