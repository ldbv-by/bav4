export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				share_dialog_link: 'Anyone, who has this link, can edit this drawing',
				share_dialog_api: 'Click to share',
				share_dialog_api_failed: 'Sharing the position has failed',
				share_dialog_copy_icon: 'Copy to clipboard',
				share_clipboard_link_notification_text: 'The link',
				share_clipboard_success: 'was copied to clipboard',
				share_clipboard_error: '"Copy to clipboard" is not available',
				share_assistChip_share_stored_data: 'Share data'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				share_dialog_link: 'Jeder, der diesen Link hat, kann an dieser Zeichnung mitarbeiten',
				share_dialog_api: 'Klicken, um zu teilen',
				share_dialog_api_failed: 'Teilen der Position ist fehlgeschlagen',
				share_dialog_copy_icon: 'In die Zwischenablage kopieren',
				share_clipboard_link_notification_text: 'Der Link',
				share_clipboard_success: 'wurde in die Zwischenablage kopiert',
				share_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung',
				share_assistChip_share_stored_data: 'Daten teilen'
			};

		default:
			return {};
	}
};
