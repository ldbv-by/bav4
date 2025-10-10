export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				oaf_mask_title: 'Filter',
				oaf_mask_ui_mode: 'Normal View',
				oaf_mask_console_mode: 'Edit CQL',
				oaf_mask_add_filter_group: 'Add Filter Group',
				oaf_mask_button_apply: 'Apply',
				oaf_mask_filter_results: 'Results:',
				oaf_mask_zoom_to_extent: 'Zoom on current result',
				oaf_mask_filter_not_displayable: 'The CQL expression cannot be displayed visually. The expression can be edited using the “Edit CQL” button.',
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
				oaf_operator_date: 'Date',
				oaf_operator_timestamp: 'Timestamp',
				oaf_operator_and: 'And',
				oaf_operator_or: 'Or',
				oaf_operator_like: 'Like',
				oaf_operator_not: 'Not',
				oaf_operator_not_between: 'Outside',
				oaf_filter_dropdown_header_title: 'Examples',
				oaf_filter_input_placeholder: 'Filter by...',
				oaf_filter_pattern_validation_msg: (params) => `Please enter a value that fits the format (e.g. ${params[0]})`
			};
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				oaf_mask_title: 'Filter',
				oaf_mask_ui_mode: 'Normale Ansicht',
				oaf_mask_console_mode: 'CQL bearbeiten',
				oaf_mask_add_filter_group: 'Neue Filtergruppe',
				oaf_mask_button_apply: 'Anwenden',
				oaf_mask_filter_results: 'Ergebnisse:',
				oaf_mask_zoom_to_extent: 'Auf aktuelles Ergebnis zoomen',
				oaf_mask_filter_not_displayable:
					'Der CQL-Ausdruck ist nicht visuell darstellbar. Mit der Schaltfläche "CQL bearbeiten" kann der Ausdruck bearbeitet werden',
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
				oaf_operator_date: 'Datum',
				oaf_operator_timestamp: 'Datum + Zeit',
				oaf_operator_and: 'Und',
				oaf_operator_or: 'Oder',
				oaf_operator_like: 'Ähnlich',
				oaf_operator_not: 'Nicht',
				oaf_filter_dropdown_header_title: 'Beispiele',
				oaf_filter_input_placeholder: 'Filtern nach...',
				oaf_filter_pattern_validation_msg: (params) => `Bitte geben Sie einen Wert ein, der dem Format entspricht (z.B. ${params[0]})`
			};
		default:
			return {};
	}
};
