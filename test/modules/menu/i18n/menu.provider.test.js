import { provide } from '../../../../src/modules/menu/i18n/menu.provider';

describe('i18n for menu module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.menu_main_open_button).toBe('Menü öffnen');
		expect(map.menu_content_panel_close_button).toBe('Schließen');
		expect(map.menu_misc_content_panel_settings).toBe('Darstellung');
		expect(map.menu_misc_content_panel_dark_mode).toBe('Dunkles Design');
		expect(map.menu_misc_content_panel_fullscreen).toBe('Vollbild');
		expect(map.menu_misc_content_panel_language).toBe('Sprache');
		expect(map.menu_misc_content_panel_information).toBe('Information');
		expect(map.menu_misc_content_panel_help).toBe('Hilfe');
		expect(map.menu_misc_content_panel_Contact).toBe('Kontakt');
		expect(map.menu_misc_content_panel_terms_of_use).toBe('Nutzungsbedingungen');
		expect(map.menu_misc_content_panel_privacy_policy).toBe('Datenschutzerklärung');
		expect(map.menu_misc_content_panel_imprint).toBe('Impressum');
		expect(map.menu_misc_content_panel_accessibility).toBe('Barrierefreiheit');
		expect(map.menu_misc_content_panel_misc_links).toBe('weitere Anwendungen');
		expect(map.menu_misc_content_panel_gdo_header).toBe('Geodaten Online');
		expect(map.menu_misc_content_panel_gdo_text).toBe('Online digitale Daten bestellen und sofort downloaden.');
		expect(map.menu_misc_content_panel_gp_header).toBe('Geoportal Bayern');
		expect(map.menu_misc_content_panel_gp_text).toBe('Zentraler Zugang zu Geodaten und Geodatendiensten.');
		expect(map.menu_misc_content_panel_ea_header).toBe('Energie-Atlas Bayern');
		expect(map.menu_misc_content_panel_ea_text).toBe(
			'Das zentrale Internet-Portal zum Energiesparen, zur Energieeffizienz und zu erneuerbaren Energien.'
		);
		expect(map.menu_misc_content_panel_feedback_title).toBe('Feedback');
		expect(map.menu_misc_content_panel_routing_title).toBe('Routing');
		expect(map.menu_misc_content_panel_login).toBe('Login BayernAtlas-plus');
		expect(map.menu_misc_content_panel_logout).toBe('Logout');

		expect(map.menu_navigation_rail_home).toBe('Home');
		expect(map.menu_navigation_rail_home_tooltip).toBe('Startansicht öffnen');
		expect(map.menu_navigation_rail_routing).toBe('Routing');
		expect(map.menu_navigation_rail_routing_tooltip).toBe('Routing öffnen');
		expect(map.menu_navigation_rail_close).toBe('Schließen');
		expect(map.menu_navigation_rail_zoom_to_extend).toBe('Ganz Bayern anzeigen');
		expect(map.menu_navigation_rail_object_info).toBe('Objekt-Info');
		expect(map.menu_navigation_rail_object_info_tooltip).toBe('Objekt-Info öffnen');
		expect(map.menu_navigation_rail_zoom_out).toBe('Karte verkleinern');
		expect(map.menu_navigation_rail_zoom_in).toBe('Karte vergrößern');
		expect(map.menu_navigation_rail_search).toBe('Suchen');
		expect(map.menu_navigation_rail_dark_theme).toBe('Dunkles Design');
		expect(map.menu_navigation_rail_light_theme).toBe('Helles Design');
		expect(map.menu_navigation_rail_feedback).toBe('Feedback');
		expect(map.menu_navigation_rail_login).toBe('Login BayernAtlas-plus');
		expect(map.menu_navigation_rail_logout).toBe('Logout');
		expect(map.menu_navigation_rail_help).toBe('Hilfe');
		expect(map.menu_navigation_rail_help_url).toBe('https://www.ldbv.bayern.de/hilfe-v4.html');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.menu_main_open_button).toBe('Open Menu');
		expect(map.menu_content_panel_close_button).toBe('Close');
		expect(map.menu_misc_content_panel_settings).toBe('Appearance');
		expect(map.menu_misc_content_panel_dark_mode).toBe('Dark theme');
		expect(map.menu_misc_content_panel_fullscreen).toBe('Fullscreen');
		expect(map.menu_misc_content_panel_language).toBe('Language');
		expect(map.menu_misc_content_panel_information).toBe('Information');
		expect(map.menu_misc_content_panel_help).toBe('Help');
		expect(map.menu_misc_content_panel_Contact).toBe('Contact');
		expect(map.menu_misc_content_panel_terms_of_use).toBe('Terms of Use');
		expect(map.menu_misc_content_panel_privacy_policy).toBe('Privacy Policy');
		expect(map.menu_misc_content_panel_imprint).toBe('Imprint');
		expect(map.menu_misc_content_panel_accessibility).toBe('Accessibility');
		expect(map.menu_misc_content_panel_misc_links).toBe('Other Applications');
		expect(map.menu_misc_content_panel_gdo_header).toBe('Geodaten Online');
		expect(map.menu_misc_content_panel_gdo_text).toBe('Order digital data online and download them immediately.');
		expect(map.menu_misc_content_panel_gp_header).toBe('Geoportal Bayern');
		expect(map.menu_misc_content_panel_gp_text).toBe('Central access to geospatial data and services.');
		expect(map.menu_misc_content_panel_ea_header).toBe('Energie-Atlas Bayern');
		expect(map.menu_misc_content_panel_ea_text).toBe('Central portal for saving energy, energy efficiency, and renewable energies.');
		expect(map.menu_misc_content_panel_feedback_title).toBe('Feedback');
		expect(map.menu_misc_content_panel_routing_title).toBe('Routing');
		expect(map.menu_misc_content_panel_login).toBe('Login BayernAtlas-plus');
		expect(map.menu_misc_content_panel_logout).toBe('Logout');

		expect(map.menu_navigation_rail_home).toBe('Home');
		expect(map.menu_navigation_rail_home_tooltip).toBe('Open home screen');
		expect(map.menu_navigation_rail_routing).toBe('Routing');
		expect(map.menu_navigation_rail_routing_tooltip).toBe('Open routing');
		expect(map.menu_navigation_rail_close).toBe('close');
		expect(map.menu_navigation_rail_zoom_to_extend).toBe('Zoom to full extent');
		expect(map.menu_navigation_rail_object_info).toBe('Object Info');
		expect(map.menu_navigation_rail_object_info_tooltip).toBe('Open Object Info');
		expect(map.menu_navigation_rail_zoom_out).toBe('Zoom out');
		expect(map.menu_navigation_rail_zoom_in).toBe('Zoom in');
		expect(map.menu_navigation_rail_search).toBe('Search');
		expect(map.menu_navigation_rail_dark_theme).toBe('Dark mode');
		expect(map.menu_navigation_rail_light_theme).toBe('Light mode');
		expect(map.menu_navigation_rail_feedback).toBe('Feedback');
		expect(map.menu_navigation_rail_login).toBe('Login BayernAtlas-plus');
		expect(map.menu_navigation_rail_logout).toBe('Logout');
		expect(map.menu_navigation_rail_help).toBe('Help');
		expect(map.menu_navigation_rail_help_url).toBe('https://www.ldbv.bayern.de/hilfe-v4.html');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 42;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
