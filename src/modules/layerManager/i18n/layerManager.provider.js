export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerManager_title: 'Layers',
				layerManager_change_visibility: 'toggle visibility',
				layerManager_opacity: 'Opacity',
				layerManager_collapse: 'collapse properties',
				layerManager_expand: 'expand properties',
				layerManager_move_up: 'move Layer up',
				layerManager_move_down: 'move Layer down',
				layerManager_remove: 'remove Layer',
				layerManager_duplicate: 'duplicate Layer',
				layerManager_layer_copy: 'Copy'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerManager_title: 'Ebenen',
				layerManager_change_visibility: 'Sichtbarkeit umschalten',
				layerManager_opacity: 'Opazität',
				layerManager_collapse: 'Eigenschaften einklappen',
				layerManager_expand: 'Eigenschaften ausklappen',
				layerManager_move_up: 'Ebene anheben',
				layerManager_move_down: 'Ebene absenken',
				layerManager_remove: 'Ebene entfernen',
				layerManager_duplicate: 'Ebene duplizieren',
				layerManager_layer_copy: 'Kopie'
			};

		default:
			return {};
	}
};
