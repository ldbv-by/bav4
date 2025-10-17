export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				geoResourceInfo_empty_geoResourceInfo: 'No Layer Information available',
				geoResourceInfo_geoResourceInfo_response_error: 'The Layer Information could not be loaded',
				geoResourceInfo_last_modified_description: 'This GeoResource was created with the draw or measure function.',
				geoResourceInfo_last_modified_description_file_id:
					'If this drawing was shared with you via a link, editing it with the draw or measure function will create a new drawing. The original drawing remains unchanged.',
				geoResourceInfo_last_modified_description_admin_id:
					'If this drawing was shared with you via a link, editing it with the draw or measure function will modify the original drawing.',
				geoResourceInfo_last_modified: 'Last modified'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				geoResourceInfo_empty_geoResourceInfo: 'Keine Ebenen-Information verfügbar',
				geoResourceInfo_geoResourceInfo_response_error: 'Die Ebenen-Information konnte nicht geladen werden',
				geoResourceInfo_last_modified_description: 'Diese GeoResource wurde mit der Zeichen- oder Messfunktion erstellt.',
				geoResourceInfo_last_modified_description_file_id:
					'Wenn diese Zeichnung über einen Link mit ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichen- oder Messfunktion eine neue Zeichnung entstehen. Die ursprüngliche Zeichnung bleibt unverändert.',
				geoResourceInfo_last_modified_description_admin_id:
					'Wenn diese Zeichnung über einen Link mit ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichen- oder Messfunktion die ursprüngliche Zeichnung verändert.',
				geoResourceInfo_last_modified: 'Letzte Änderung'
			};

		default:
			return {};
	}
};
