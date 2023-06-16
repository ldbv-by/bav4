export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_assistChips_share_position_label: 'Share position',
				map_assistChips_share_position_clipboard_success: 'was copied to clipboard',
				map_assistChips_share_position_clipboard_error: '"Copy to clipboard" is not available',
				map_assistChips_share_position_link_title: 'shared position with BayernAtlas.de'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_assistChips_share_position_label: 'Position teilen',
				map_assistChips_share_position_clipboard_success: 'wurde in die Zwischenablage kopiert',
				map_assistChips_share_position_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				map_assistChips_share_position_link_title: 'Position geteilt über BayernAtlas.de'
			};

		default:
			return {};
	}
};
