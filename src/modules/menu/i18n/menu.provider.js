export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Open Menu',
				misc_content_panel_settings: 'Appearance',
				misc_content_panel_dark_mode: 'Dark theme',
				misc_content_panel_fullscreen: 'Fullscreen',
				misc_content_panel_language: 'Language',
				misc_content_panel_information: 'Information',
				misc_content_panel_help: 'Help',
				misc_content_panel_Contact: 'Contact',
				misc_content_panel_github: 'GitHub',
				misc_content_panel_terms_of_use: 'Terms of Use',
				misc_content_panel_privacy_policy: 'Privacy Policy',
				misc_content_panel_imprint: 'Imprint',
				misc_content_panel_more_links: 'More Applications',
				misc_content_panel_gdo_header: 'Geodaten Online',
				misc_content_panel_gdo_text: 'Order digital data online and download them immediately.',
				misc_content_panel_gp_header: 'Geoportal Bayern',
				misc_content_panel_gp_text: 'Central access to geospatial data and services.',
				misc_content_panel_ea_header: 'Energie-Atlas Bayern',
				misc_content_panel_ea_text: 'Central portal for saving energy, energy efficiency, and renewable energies.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Menü öffnen',
				misc_content_panel_settings: 'Darstellung',
				misc_content_panel_dark_mode: 'Dunkles Design',
				misc_content_panel_fullscreen: 'Vollbild',
				misc_content_panel_language: 'Sprache',
				misc_content_panel_information: 'Information',
				misc_content_panel_help: 'Hilfe',
				misc_content_panel_Contact: 'Kontakt',
				misc_content_panel_github: 'GitHub',
				misc_content_panel_terms_of_use: 'Nutzungsbedingungen',
				misc_content_panel_privacy_policy: 'Datenschutzerklärung',
				misc_content_panel_imprint: 'Impressum',
				misc_content_panel_more_links: 'weitere Anwendungen',
				misc_content_panel_gdo_header: 'Geodaten Online',
				misc_content_panel_gdo_text: 'Online digitale Daten bestellen und sofort downloaden.',
				misc_content_panel_gp_header: 'Geoportal Bayern',
				misc_content_panel_gp_text: 'Zentraler Zugang zu Geodaten und Geodatendiensten.',
				misc_content_panel_ea_header: 'Energie-Atlas Bayern',
				misc_content_panel_ea_text: 'Das zentrale Internet-Portal zum Energiesparen, zur Energieeffizienz und zu erneuerbaren Energien.'
			};

		default:
			return {};
	}
};
