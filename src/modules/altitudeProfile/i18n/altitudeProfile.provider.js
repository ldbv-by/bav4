export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				altitudeProfile_header: 'this is a header',
				altitudeProfile_distance: 'Distance',
				altitudeProfile_incline: 'Incline',
				altitudeProfile_sumUp: 'SumUp',
				altitudeProfile_sumDown: 'SumDown',
				altitudeProfile_elevation: 'Elevation',
				altitudeProfile_alt: 'Elevation',
				altitudeProfile_slope: 'Slope',
				altitudeProfile_surface: 'surface',
				altitudeProfile_anotherType: 'anotherType',
				altitudeProfile_unknown: 'unknown'
			};

		case 'de':
			return {
				altitudeProfile_header: 'this is a header',
				altitudeProfile_distance: 'Entfernung',
				altitudeProfile_incline: 'Steigung',
				altitudeProfile_sumUp: 'SumUp de',
				altitudeProfile_sumDown: 'SumDown de',
				altitudeProfile_elevation: 'Höhe',
				altitudeProfile_alt: 'Höhe',
				altitudeProfile_slope: 'Steigung',
				altitudeProfile_surface: 'Untergrund',
				altitudeProfile_anotherType: 'anotherType',
				altitudeProfile_unknown: 'unbekannt'
			};

		default:
			return {};
	}
};
