export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				layer_manager_title: 'Layers',	
				layer_manager_change_visibility: 'toggle visibility',
				layer_manager_opacity:'Opacity',
				layer_manager_collapse:'collapse properties',
				layer_manager_expand:'expand properties',
				layer_manager_move_up: 'move Layer up',		
				layer_manager_move_down: 'move Layer down',
				layer_manager_remove: 'remove Layer'				
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layer_manager_title: 'Ebenen',
				layer_manager_change_visibility: 'Sichtbarkeit umschalten',			
				layer_manager_opacity:'Opazität',
				layer_manager_collapse:'Eigenschaften einklappen',
				layer_manager_expand:'Eigenschaften ausklappen',
				layer_manager_move_up: 'Ebene anheben',	
				layer_manager_move_down: 'Ebene absenken',		
				layer_manager_remove: 'Ebene entfernen'								
			};

		default:
			return {};
	}
};