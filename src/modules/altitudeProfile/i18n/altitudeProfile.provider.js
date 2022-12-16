export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				altitudeProfile_header: 'this is a header',
				altitudeProfile_distance: 'Distance',
				altitudeProfile_slope: 'Slope',
				altitudeProfile_sumUp: 'Ascent',
				altitudeProfile_sumDown: 'Descent',
				altitudeProfile_alt: 'Elevation',
				altitudeProfile_surface: 'surface',
				altitudeProfile_anotherType: 'anotherType',
				altitudeProfile_unknown: 'unknown'
			};

		case 'de':
			return {
				altitudeProfile_header: 'this is a header',
				altitudeProfile_distance: 'Entfernung',
				altitudeProfile_slope: 'Steigung',
				altitudeProfile_sumUp: 'Aufstieg',
				altitudeProfile_sumDown: 'Abstieg',
				altitudeProfile_alt: 'Höhe',
				altitudeProfile_surface: 'Untergrund',
				altitudeProfile_anotherType: 'anotherType',
				altitudeProfile_unknown: 'unbekannt'
			};

		default:
			return {};
	}
};
