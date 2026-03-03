export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				share_dialog_link_title: 'Editability',
				share_dialog_link_original:
					'Everyone who has this link can modify the original drawing without having to generate a new link. This function is useful for drawings that are edited by several people.',
				share_dialog_link_copy:
					'Everyone who has this link can modify the original drawing. By modification a new drawing will be created that only can be shared with a new link. This function is useful for drawings that shouldn’t be edited by others.',
				share_dialog_api: 'Click to share',
				share_dialog_api_failed: 'Sharing has failed',
				share_dialog_copy_icon: 'Copy to clipboard',
				share_dialog_infographic_original: 'Original',
				share_dialog_infographic_copy: 'Copy',
				share_clipboard_link_notification_text: 'The link',
				share_clipboard_success: 'was copied to clipboard',
				share_clipboard_error: '"Copy to clipboard" is not available'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				share_dialog_link_title: 'Editierbarkeit',
				share_dialog_link_original:
					'Alle, die über diesen Link verfügen, können die Original-Zeichnung verändern, ohne dass ein neuer Link generiert werden muss. Diese Funktion ist sinnvoll für Zeichnungen, die von mehreren Personen bearbeitet werden.',
				share_dialog_link_copy:
					'Alle, die über diesen Link verfügen, können die Zeichnung sehen und verändern. Wird die Zeichnung verändert, entsteht dadurch eine neue Zeichnung, die man nur durch die Erzeugung eines neuen Links wiederum teilen kann. Diese Funktion ist sinnvoll für Zeichnungen, die nur mit anderen geteilt, jedoch nicht von mehreren Personen bearbeitet werden sollen.',
				share_dialog_api: 'Klicken, um zu teilen',
				share_dialog_api_failed: 'Das Teilen ist fehlgeschlagen',
				share_dialog_copy_icon: 'In die Zwischenablage kopieren',
				share_dialog_infographic_original: 'Original',
				share_dialog_infographic_copy: 'Kopie',
				share_clipboard_link_notification_text: 'Der Link',
				share_clipboard_success: 'wurde in die Zwischenablage kopiert',
				share_clipboard_error: '"In die Zwischenablage kopieren" steht nicht zur Verfügung'
			};

		default:
			return {};
	}
};
