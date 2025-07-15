export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				oaf_mask_title: 'Filter',
				oaf_mask_ui_mode: 'Normal View',
				oaf_mask_console_mode: 'Console View',
				oaf_mask_add_filter_group: 'Add Filter Group',
				oaf_mask_button_apply: 'Apply',
				oaf_mask_filter_results: 'Results:',
				oaf_mask_zoom_to_extent: 'Center extent',
				oaf_group_select_filter: 'Select Filter...',
				oaf_mask_or: 'OR',
				oaf_filter_yes: 'Yes',
				oaf_filter_no: 'No',
				oaf_operator_equals: 'Equals',
				oaf_operator_not_equals: 'Not equals',
				oaf_operator_contains: 'Contains',
				oaf_operator_not_contains: "Doesn't contain",
				oaf_operator_begins_with: 'Begins with',
				oaf_operator_not_begins_with: "Doesn't begin with",
				oaf_operator_ends_with: 'Ends with',
				oaf_operator_not_ends_with: "Doesn't end with",
				oaf_operator_greater: 'Greater than',
				oaf_operator_greater_equals: 'Greater or equal',
				oaf_operator_less: 'Less than',
				oaf_operator_less_equals: 'Less or equal',
				oaf_operator_between: 'Between',
				oaf_operator_not_between: 'Outside',
				oaf_filter_dropdown_header_title: 'Examples',
				oaf_filter_input_placeholder: 'Filter by...'
			};
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				oaf_mask_title: 'Filter',
				oaf_mask_ui_mode: 'Normale Ansicht',
				oaf_mask_console_mode: 'Konsolen Ansicht',
				oaf_mask_add_filter_group: 'Neue Filtergruppe',
				oaf_mask_button_apply: 'Anwenden',
				oaf_mask_filter_results: 'Ergebnisse:',
				oaf_mask_zoom_to_extent: 'Ausschnitt zentrieren',
				oaf_group_select_filter: 'Wähle Filter...',
				oaf_mask_or: 'ODER',
				oaf_filter_yes: 'Ja',
				oaf_filter_no: 'Nein',
				oaf_operator_equals: 'Ist gleich',
				oaf_operator_not_equals: 'Ist ungleich',
				oaf_operator_contains: 'Enthält',
				oaf_operator_not_contains: 'Enthält nicht',
				oaf_operator_begins_with: 'Beginnt mit',
				oaf_operator_not_begins_with: 'Beginnt nicht mit',
				oaf_operator_ends_with: 'Endet mit',
				oaf_operator_not_ends_with: 'Endet nicht mit',
				oaf_operator_greater: 'Größer als',
				oaf_operator_greater_equals: 'Größer gleich',
				oaf_operator_less: 'Kleiner als',
				oaf_operator_less_equals: 'Kleiner gleich',
				oaf_operator_between: 'Zwischen',
				oaf_operator_not_between: 'Außerhalb',
				oaf_filter_dropdown_header_title: 'Beispiele',
				oaf_filter_input_placeholder: 'Filtern nach...'
			};
		default:
			return {};
	}
};
