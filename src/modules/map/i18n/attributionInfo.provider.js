export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Data',
				map_attributionInfo_collapse_title_open: 'Show all',
				map_attributionInfo_collapse_title_close: 'Close',
				map_privacy_policy_link: 'Privacy Policy',
				map_privacy_policy_url: 'https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_attributionInfo_label: 'Daten',
				map_attributionInfo_collapse_title_open: 'Alle anzeigen',
				map_attributionInfo_collapse_title_close: 'Schließen',
				map_privacy_policy_link: 'Datenschutzerklärung',
				map_privacy_policy_url: 'https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html'
			};

		default:
			return {};
	}
};
