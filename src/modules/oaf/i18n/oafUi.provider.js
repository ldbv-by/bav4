export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				oafUi_mask_ui_mode: 'Normal View',
				oafUi_mask_console_mode: 'Console View',
				oafUi_mask_add_filter_group: 'Add Filter Group',
				oafUi_group_title: 'Filter Group',
				oafUi_group_select_filter: 'Select Filter...',
				oafUi_mask_or: 'OR',
				oafUi_filter_yes: 'Yes',
				oafUi_filter_no: 'No'
			};
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				oafUi_mask_ui_mode: 'Normale Ansicht',
				oafUi_mask_console_mode: 'Konsolen Ansicht',
				oafUi_mask_add_filter_group: 'Neue Filtergruppe',
				oafUi_group_title: 'Filtergruppe',
				oafUi_group_select_filter: 'Wähle Filter...',
				oafUi_mask_or: 'ODER',
				oafUi_filter_yes: 'Ja',
				oafUi_filter_no: 'Nein'
			};
		default:
			return {};
	}
};
