export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Base maps',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vector',
				baseLayer_container_scroll_button_raster: 'Scroll to raster maps',
				baseLayer_container_scroll_button_vector: 'Scroll to vector maps'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Basiskarten',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vektor',
				baseLayer_container_scroll_button_raster: 'Zu den Rasterkarten',
				baseLayer_container_scroll_button_vector: 'Zu den Vektorkarten'
			};

		default:
			return {};
	}
};
