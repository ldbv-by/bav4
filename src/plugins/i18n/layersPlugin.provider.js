
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				layersPlugin_store_layer_default_layer_name: 'Data'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				layersPlugin_store_layer_default_layer_name: 'Daten'
			};

		default:
			return {};
	}
};
