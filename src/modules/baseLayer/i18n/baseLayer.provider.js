export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Base maps',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vector',
				baseLayer_container_scroll_button_raster: 'Scroll to raster maps',
				baseLayer_container_scroll_button_vector: 'Scroll to vector maps',
				baseLayer_container_category_standard: 'Basis',
				baseLayer_container_category_planung: 'Planung',
				baseLayer_container_category_freizeit: 'Freizeit',
				baseLayer_container_category_historisch: 'Historisch'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Basiskarten',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vektor',
				baseLayer_container_scroll_button_raster: 'Zu den Rasterkarten',
				baseLayer_container_scroll_button_vector: 'Zu den Vektorkarten',
				baseLayer_container_category_standard: 'Basis',
				baseLayer_container_category_planung: 'Planung',
				baseLayer_container_category_freizeit: 'Freizeit',
				baseLayer_container_category_historisch: 'Historisch'
			};

		default:
			return {};
	}
};
