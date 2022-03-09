export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Open Menu',
				menu_misc_content_panel_settings: 'Appearance',
				menu_misc_content_panel_dark_mode: 'Dark theme',
				menu_misc_content_panel_fullscreen: 'Fullscreen',
				menu_misc_content_panel_language: 'Language',
				menu_misc_content_panel_information: 'Information',
				menu_misc_content_panel_help: 'Help',
				menu_misc_content_panel_Contact: 'Contact',
				menu_misc_content_panel_terms_of_use: 'Terms of Use',
				menu_misc_content_panel_privacy_policy: 'Privacy Policy',
				menu_misc_content_panel_imprint: 'Imprint',
				menu_misc_content_panel_misc_links: 'Other Applications',
				menu_misc_content_panel_gdo_header: 'Geodaten Online',
				menu_misc_content_panel_gdo_text: 'Order digital data online and download them immediately.',
				menu_misc_content_panel_gp_header: 'Geoportal Bayern',
				menu_misc_content_panel_gp_text: 'Central access to geospatial data and services.',
				menu_misc_content_panel_ea_header: 'Energie-Atlas Bayern',
				menu_misc_content_panel_ea_text: 'Central portal for saving energy, energy efficiency, and renewable energies.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Menü öffnen',
				menu_misc_content_panel_settings: 'Darstellung',
				menu_misc_content_panel_dark_mode: 'Dunkles Design',
				menu_misc_content_panel_fullscreen: 'Vollbild',
				menu_misc_content_panel_language: 'Sprache',
				menu_misc_content_panel_information: 'Information',
				menu_misc_content_panel_help: 'Hilfe',
				menu_misc_content_panel_Contact: 'Kontakt',
				menu_misc_content_panel_terms_of_use: 'Nutzungsbedingungen',
				menu_misc_content_panel_privacy_policy: 'Datenschutzerklärung',
				menu_misc_content_panel_imprint: 'Impressum',
				menu_misc_content_panel_misc_links: 'weitere Anwendungen',
				menu_misc_content_panel_gdo_header: 'Geodaten Online',
				menu_misc_content_panel_gdo_text: 'Online digitale Daten bestellen und sofort downloaden.',
				menu_misc_content_panel_gp_header: 'Geoportal Bayern',
				menu_misc_content_panel_gp_text: 'Zentraler Zugang zu Geodaten und Geodatendiensten.',
				menu_misc_content_panel_ea_header: 'Energie-Atlas Bayern',
				menu_misc_content_panel_ea_text: 'Das zentrale Internet-Portal zum Energiesparen, zur Energieeffizienz und zu erneuerbaren Energien.'
			};

		default:
			return {};
	}
};
