export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Base maps',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vector'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				baseLayer_switcher_header: 'Basiskarten',
				baseLayer_container_category_raster: 'Raster',
				baseLayer_container_category_vector: 'Vektor'
			};

		default:
			return {};
	}
};
