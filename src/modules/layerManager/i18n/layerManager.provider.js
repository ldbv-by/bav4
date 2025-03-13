export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerManager_title: 'Layers',
				layerManager_change_visibility: 'Toggle visibility',
				layerManager_opacity: 'Opacity',
				layerManager_opacity_badge: 'Opacity in percent',
				layerManager_collapse: 'Collapse properties',
				layerManager_expand: 'Expand properties',
				layerManager_move_up: 'Move layer up',
				layerManager_move_down: 'Move layer down',
				layerManager_info: 'Info',
				layerManager_remove: 'Remove layer',
				layerManager_to_copy: 'Copy layer',
				layerManager_zoom_to_extent: 'Zoom to extent',
				layerManager_layer_copy: 'Copy',
				layerManager_expand_all: 'Expand all',
				layerManager_expand_all_title: 'Expand all layers',
				layerManager_collapse_all: 'Collapse all',
				layerManager_collapse_all_title: 'Collapse all layers',
				layerManager_remove_all: 'Remove all overlays',
				layerManager_remove_all_title: 'Remove all overlay layers except for the basemap',
				layerManager_compare: 'Start comparison tool',
				layerManager_compare_title: 'Start comparison tool with current layers',
				layerManager_compare_stop: 'Exit comparison tool',
				layerManager_compare_stop_title: 'Exit comparison tool, return to normal view',
				layerManager_compare_share: 'Share the view',
				layerManager_loading_hint: 'Loading',
				layerManager_time_travel_hint: 'Choose a year',
				layerManager_time_travel_slider: 'Open slider',
				layerManager_compare_left: 'Left',
				layerManager_compare_left_title: 'Set layer on left side',
				layerManager_compare_both: 'Both',
				layerManager_compare_both_title: 'Set layer on both sides',
				layerManager_compare_right: 'Right',
				layerManager_compare_right_title: 'Set layer on right side'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				layerManager_title: 'Ebenen',
				layerManager_change_visibility: 'Sichtbarkeit umschalten',
				layerManager_opacity: 'Deckkraft',
				layerManager_opacity_badge: 'Deckkraft in Prozent',
				layerManager_collapse: 'Eigenschaften einklappen',
				layerManager_expand: 'Eigenschaften ausklappen',
				layerManager_move_up: 'Ebene anheben',
				layerManager_move_down: 'Ebene absenken',
				layerManager_info: 'Info',
				layerManager_remove: 'Ebene entfernen',
				layerManager_to_copy: 'Ebene kopieren',
				layerManager_zoom_to_extent: 'Auf Inhalt zoomen',
				layerManager_layer_copy: 'Kopie',
				layerManager_expand_all: 'Alle ausklappen',
				layerManager_expand_all_title: 'Alle Ebenen ausklappen',
				layerManager_collapse_all: 'Alle einklappen',
				layerManager_collapse_all_title: 'Alle Ebenen einklappen',
				layerManager_remove_all: 'Überlagerungen entfernen',
				layerManager_remove_all_title: 'Alle Überlagerungen entfernen, bis auf die Basiskarte',
				layerManager_compare: 'Vergleichen starten',
				layerManager_compare_title: 'Vergleichen starten mit den aktuellen Ebenen',
				layerManager_compare_stop: 'Vergleichen beenden',
				layerManager_compare_stop_title: 'Vergleichen beenden, zur normalen Ansicht zurückkehren',
				layerManager_compare_share: 'Ansicht teilen',
				layerManager_loading_hint: 'Wird geladen',
				layerManager_time_travel_hint: 'Bitte ein Jahr auswählen',
				layerManager_time_travel_slider: 'Schieberegler öffnen',
				layerManager_compare_left: 'Links',
				layerManager_compare_left_title: 'Ebene auf die linke Seite setzen',
				layerManager_compare_both: 'Beide',
				layerManager_compare_both_title: 'Ebene auf beide Seiten setzen',
				layerManager_compare_right: 'Rechts',
				layerManager_compare_right_title: 'Ebene auf die rechte Seite setzen'
			};

		default:
			return {};
	}
};
