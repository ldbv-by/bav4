export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				share_shareDialogContent_link: 'Anyone, who has this link, can edit this drawing',
				share_shareDialogContent_link_title: 'shared with BayernAtlas.de',
				share_shareDialogContent_api: 'Click to share',
				share_shareDialogContent_copy_icon: 'Copy to clipboard',
				share_clipboard_link_notification_text: 'The link',
				share_clipboard_success: 'was copied to clipboard',
				share_clipboard_error: '"Copy to clipboard" is not available'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				share_shareDialogContent_link: 'Jeder, der diesen Link hat, kann an dieser Zeichnung mitarbeiten',
				share_shareDialogContent_link_title: 'geteilt über BayernAtlas.de',
				share_shareDialogContent_api: 'Klicken, um zu teilen',
				share_shareDialogContent_copy_icon: 'In die Zwischenablage kopieren',
				share_clipboard_link_notification_text: 'Der Link',
				share_clipboard_success: 'wurde in die Zwischenablage kopiert',
				share_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung'
			};

		default:
			return {};
	}
};
