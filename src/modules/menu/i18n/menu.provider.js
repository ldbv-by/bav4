export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Open Menu',
				more_content_panel_settings: 'Settings',
				more_content_panel_dark_mode: 'Dark mode',
				more_content_panel_fullscreen: 'Fullscreen',
				more_content_panel_language: 'Language',
				more_content_panel_information: 'Information',
				more_content_panel_help: 'Help',
				more_content_panel_Contact: 'Contact',
				more_content_panel_github: 'GitHub',
				more_content_panel_terms_of_use: 'Terms of Use',
				more_content_panel_privacy_policy: 'Privacy Policy',
				more_content_panel_imprint: 'Imprint',
				more_content_panel_more_links: 'more Links',
				more_content_panel_gdo_header: 'Geodaten Online',
				more_content_panel_gdo_text: 'Online digitale Daten bestellen und sofort downloaden',
				more_content_panel_gp_header: 'Geoportal Bayern',
				more_content_panel_gp_text: 'Zentraler Zugang zu Geodaten und Geodatendiensten'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Menü öffnen',
				more_content_panel_settings: 'Einstellungen',
				more_content_panel_dark_mode: 'Dark mode',
				more_content_panel_fullscreen: 'Vollbild',
				more_content_panel_language: 'Sprache',
				more_content_panel_information: 'Information',
				more_content_panel_help: 'Hilfe',
				more_content_panel_Contact: 'Kontakt',
				more_content_panel_github: 'GitHub',
				more_content_panel_terms_of_use: 'Nutzungsbedingungen',
				more_content_panel_privacy_policy: 'Datenschutzerklärung',
				more_content_panel_imprint: 'Impressum',
				more_content_panel_more_links: 'weitere Links',
				more_content_panel_gdo_header: 'Geodaten Online',
				more_content_panel_gdo_text: 'Online digitale Daten bestellen und sofort downloaden',
				more_content_panel_gp_header: 'Geoportal Bayern',
				more_content_panel_gp_text: 'Zentraler Zugang zu Geodaten und Geodatendiensten'
			};

		default:
			return {};
	}
};
