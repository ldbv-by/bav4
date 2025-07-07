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
				oaf_group_select_filter: 'Select Filter...',
				oaf_mask_or: 'OR',
				oaf_filter_yes: 'Yes',
				oaf_filter_no: 'No',
				oaf_operator_equals: 'Equals',
				oaf_operator_not_equals: 'Not equals',
				oaf_operator_like: 'Like',
				oaf_operator_not_like: 'Not like',
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
				oaf_group_select_filter: 'Wähle Filter...',
				oaf_mask_or: 'ODER',
				oaf_filter_yes: 'Ja',
				oaf_filter_no: 'Nein',
				oaf_operator_equals: 'Ist gleich',
				oaf_operator_not_equals: 'Ist ungleich',
				oaf_operator_like: 'Enthält',
				oaf_operator_not_like: 'Enthält nicht',
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
