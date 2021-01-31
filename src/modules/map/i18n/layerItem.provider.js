export const layerItemProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module				
				layer_item_change_visibility: 'toggle visibility',
				layer_item_opacity:'Opacity',
				layer_item_collapse:'collapse properties',
				layer_item_expand:'expand properties',
				layer_item_move_up: 'move Layer up',		
				layer_item_move_down: 'move Layer down'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module				
				layer_item_change_visibility: 'Sichtbarkeit umschalten',			
				layer_item_opacity:'Opazität',
				layer_item_collapse:'Eigenschaften einklappen',
				layer_item_expand:'Eigenschaften ausklappen',
				layer_item_move_up: 'Ebene anheben',	
				layer_item_move_down: 'Ebene absenken'		
			};

		default:
			return {};
	}
};