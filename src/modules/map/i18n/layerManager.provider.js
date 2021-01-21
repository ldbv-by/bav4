export const layerManagerProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				layer_manager_title: 'Layers',	
				layer_manager_change_visibility: 'toggle visibility'			
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layer_manager_title: 'Ebenen',				
				layer_manager_change_visibility: 'Sichtbarkeit umschalten'			
			};

		default:
			return {};
	}
};