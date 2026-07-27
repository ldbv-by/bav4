export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				elevationProfile_header: 'Elevation Profile',
				elevationProfile_distance: 'Distance',
				elevationProfile_slope: 'Slope',
				elevationProfile_lineOfSight: 'Line of sight',
				elevationProfile_lineOfSight_visible: 'Visible',
				elevationProfile_lineOfSight_not_visible: 'Not visible',
				elevationProfile_sumUp: 'Uphill',
				elevationProfile_sumDown: 'Downhill',
				elevationProfile_alt: 'Elevation',
				elevationProfile_relativeZ: 'Relative Elevation',
				elevationProfile_surface: 'Surface',
				elevationProfile_elevation_profile: 'Elevation Profile',
				elevationProfile_verticalHeight: 'Elevation difference start - end',
				elevationProfile_highestPoint: 'Highest point',
				elevationProfile_lowestPoint: 'Lowest point',
				elevationProfile_linearDistance: 'Distance',
				elevationProfile_could_not_load: 'Elevation Profile could not be loaded',
				elevationProfile_unknown: 'unknown'
			};

		case 'de':
			return {
				elevationProfile_header: 'Geländeprofil',
				elevationProfile_distance: 'Entfernung',
				elevationProfile_slope: 'Steigung',
				elevationProfile_lineOfSight: 'Sichtbarkeit',
				elevationProfile_lineOfSight_visible: 'Sichtbar',
				elevationProfile_lineOfSight_not_visible: 'Nicht sichtbar',
				elevationProfile_sumUp: 'Bergauf',
				elevationProfile_sumDown: 'Bergab',
				elevationProfile_alt: 'Höhe',
				elevationProfile_relativeZ: 'Relative Höhe',
				elevationProfile_surface: 'Untergrund',
				elevationProfile_elevation_profile: 'Höhenprofil',
				elevationProfile_verticalHeight: 'Höhendifferenz Start - Ende',
				elevationProfile_highestPoint: 'Höchster Punkt',
				elevationProfile_lowestPoint: 'Tiefster Punkt',
				elevationProfile_linearDistance: 'Distanz',
				elevationProfile_could_not_load: 'Das Höhenprofil konnte nicht geladen werden',
				elevationProfile_unknown: 'unbekannt'
			};

		default:
			return {};
	}
};
