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
				layerManager_move_up: 'move layer up',
				layerManager_move_down: 'move layer down',
				layerManager_remove: 'remove layer',
				layerManager_to_copy: 'Copy layer',
				layerManager_zoom_to_extent: 'Zoom to extent',
				layerManager_layer_copy: 'copy',
				layerManager_expand_all: 'expand all',
				layerManager_collapse_all: 'collapse all',
				layerManager_remove_all: 'remove all',
				layerManager_compare: 'Start comparison tool',
				layerManager_compare_stop: 'Exit comparison tool',
				layerManager_loading_hint: 'Loading',
				layerManager_time_travel_hint: 'Choose a year',
				layerManager_time_travel_slider: 'Open slider',
				layerManager_compare_left: 'Left',
				layerManager_compare_both: 'Both',
				layerManager_compare_right: 'Right'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerManager_title: 'Ebenen',
				layerManager_change_visibility: 'Sichtbarkeit umschalten',
				layerManager_opacity: 'Deckkraft',
				layerManager_collapse: 'Eigenschaften einklappen',
				layerManager_expand: 'Eigenschaften ausklappen',
				layerManager_move_up: 'Ebene anheben',
				layerManager_move_down: 'Ebene absenken',
				layerManager_remove: 'Ebene entfernen',
				layerManager_to_copy: 'Ebene kopieren',
				layerManager_zoom_to_extent: 'Auf Inhalt zoomen',
				layerManager_layer_copy: 'Kopie',
				layerManager_expand_all: 'Alle ausklappen',
				layerManager_collapse_all: 'Alle einklappen',
				layerManager_remove_all: 'Alle entfernen',
				layerManager_compare: 'Vergleichen starten',
				layerManager_compare_stop: 'Vergleichen beenden',
				layerManager_loading_hint: 'Wird geladen',
				layerManager_time_travel_hint: 'Bitte ein Jahr auswählen',
				layerManager_time_travel_slider: 'Schieberegler öffnen',
				layerManager_compare_left: 'Links',
				layerManager_compare_both: 'Beide',
				layerManager_compare_right: 'Rechts'
			};

		default:
			return {};
	}
};
