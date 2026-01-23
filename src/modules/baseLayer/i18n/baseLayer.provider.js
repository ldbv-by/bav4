export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Base maps',
				baseLayer_container_scroll_button_next: 'Scroll next',
				baseLayer_container_scroll_button_last: 'Scroll back',
				baseLayer_container_category_standard: 'General',
				baseLayer_container_category_raster: 'Raster data',
				baseLayer_container_category_vector: 'Vector data',
				baseLayer_container_scroll_button_standard: 'To the general maps',
				baseLayer_container_category_planung: 'Planning',
				baseLayer_container_scroll_button_planung: 'To the planning maps',
				baseLayer_container_category_freizeit: 'Leisure time',
				baseLayer_container_scroll_button_freizeit: 'To the leisure maps',
				baseLayer_container_category_historisch: 'Historical',
				baseLayer_container_scroll_button_historisch: 'To the historical maps',
				baseLayer_container_collapse_button_title: 'Collapse/Expand base map switcher'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Basiskarten',
				baseLayer_container_scroll_button_next: 'Weiterblättern',
				baseLayer_container_scroll_button_last: 'Zurückblättern',
				baseLayer_container_category_raster: 'Rasterdaten',
				baseLayer_container_category_vector: 'Vektordaten',
				baseLayer_container_category_standard: 'Allgemein',
				baseLayer_container_scroll_button_standard: 'Zu den allgemeinen Karten',
				baseLayer_container_category_planung: 'Planung',
				baseLayer_container_scroll_button_planung: 'Zu den Planungskarten',
				baseLayer_container_category_freizeit: 'Freizeit',
				baseLayer_container_scroll_button_freizeit: 'Zu den Freizeitkarten',
				baseLayer_container_category_historisch: 'Historisch',
				baseLayer_container_scroll_button_historisch: 'Zu den historischen Karten',
				baseLayer_container_collapse_button_title: 'Basiskarten-Umschalter ein-/ausklappen'
			};

		default:
			return {};
	}
};
