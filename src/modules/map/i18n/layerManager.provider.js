export const layerManagerProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				layer_manager_title: 'Layers',					
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layer_manager_title: 'Ebenen',								
			};

		default:
			return {};
	}
};