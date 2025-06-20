export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				oaf_mask_ui_mode: 'Normal View',
				oaf_mask_console_mode: 'Console View',
				oaf_mask_add_filter_group: 'Add Filter Group',
				oaf_group_title: 'Filter Group',
				oaf_group_select_filter: 'Select Filter...',
				oaf_mask_or: 'OR',
				oaf_filter_yes: 'Yes',
				oaf_filter_no: 'No',
				oaf_operator_equals: 'Equals',
				oaf_operator_like: 'Like',
				oaf_operator_greater: 'Greater Than',
				oaf_operator_lesser: 'Less Than',
				oaf_operator_between: 'Between'
			};
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				oaf_mask_ui_mode: 'Normale Ansicht',
				oaf_mask_console_mode: 'Konsolen Ansicht',
				oaf_mask_add_filter_group: 'Neue Filtergruppe',
				oaf_group_title: 'Filtergruppe',
				oaf_group_select_filter: 'Wähle Filter...',
				oaf_mask_or: 'ODER',
				oaf_filter_yes: 'Ja',
				oaf_filter_no: 'Nein',
				oaf_operator_equals: 'Ist gleich',
				oaf_operator_like: 'Enthält',
				oaf_operator_greater: 'Größer als',
				oaf_operator_lesser: 'Kleiner als',
				oaf_operator_between: 'Zwischen'
			};
		default:
			return {};
	}
};
