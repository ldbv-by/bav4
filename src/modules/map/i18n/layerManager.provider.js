export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_layerManager_title: 'Layers',
				map_layerManager_change_visibility: 'toggle visibility',
				map_layerManager_opacity: 'Opacity',
				map_layerManager_collapse: 'collapse properties',
				map_layerManager_expand: 'expand properties',
				map_layerManager_move_up: 'move Layer up',
				map_layerManager_move_down: 'move Layer down',
				map_layerManager_remove: 'remove Layer'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_layerManager_title: 'Ebenen',
				map_layerManager_change_visibility: 'Sichtbarkeit umschalten',
				map_layerManager_opacity: 'Opazität',
				map_layerManager_collapse: 'Eigenschaften einklappen',
				map_layerManager_expand: 'Eigenschaften ausklappen',
				map_layerManager_move_up: 'Ebene anheben',
				map_layerManager_move_down: 'Ebene absenken',
				map_layerManager_remove: 'Ebene entfernen'
			};

		default:
			return {};
	}
};
