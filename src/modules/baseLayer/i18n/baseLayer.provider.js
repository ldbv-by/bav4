export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Base maps',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vector',
				baseLayer_container_scroll_button_left: 'scroll to right',
				baseLayer_container_scroll_button_right: 'scroll to left'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Basiskarten',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vektor',
				baseLayer_container_scroll_button_left: 'nach rechts scrollen',
				baseLayer_container_scroll_button_right: 'nach links scrollen'
			};

		default:
			return {};
	}
};
