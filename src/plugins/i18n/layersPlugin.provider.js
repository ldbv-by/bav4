
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				layersPlugin_store_layer_default_layer_name_vector: 'Data',
				layersPlugin_store_layer_default_layer_name_future: 'Loading...'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				layersPlugin_store_layer_default_layer_name_vector: 'Daten',
				layersPlugin_store_layer_default_layer_name_future: 'Wird geladen...'
			};

		default:
			return {};
	}
};
