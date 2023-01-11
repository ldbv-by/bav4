export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				altitudeProfile_distance: 'Distance',
				altitudeProfile_slope: 'Slope',
				altitudeProfile_sumUp: 'Ascent',
				altitudeProfile_sumDown: 'Descent',
				altitudeProfile_alt: 'Elevation',
				altitudeProfile_surface: 'surface',
				altitudeProfile_elevation_reference_system: 'DGM 25 / DHHN2016',
				altitudeProfile_elevation_profile: 'Elevation Profile',
				altitudeProfile_unknown: 'unknown'
			};

		case 'de':
			return {
				altitudeProfile_distance: 'Entfernung',
				altitudeProfile_slope: 'Steigung',
				altitudeProfile_sumUp: 'Aufstieg',
				altitudeProfile_sumDown: 'Abstieg',
				altitudeProfile_alt: 'Höhe',
				altitudeProfile_surface: 'Untergrund',
				altitudeProfile_elevation_reference_system: 'DGM 25 / DHHN2016',
				altitudeProfile_elevation_profile: 'Höhenprofil',
				altitudeProfile_unknown: 'unbekannt'
			};

		default:
			return {};
	}
};
