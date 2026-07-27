export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				geoResourceInfo_empty_geoResourceInfo: 'No Layer Information available',
				geoResourceInfo_geoResourceInfo_response_error: 'The Layer Information could not be loaded',
				geoResourceInfo_last_modified_description: 'This GeoResource was created with the draw or measure function.',
				geoResourceInfo_last_modified_description_copy:
					'If this drawing was shared with you via a link, editing it with the draw or measure function will create a new drawing. The original drawing remains unchanged.',
				geoResourceInfo_last_modified_description_collaborative:
					'If this drawing was shared with you via a link, editing it with the draw or measure function will modify the original drawing.',
				geoResourceInfo_last_modified: 'Last modified',
				geoResourceInfo_infographic_collaboration_original: 'Original',
				geoResourceInfo_infographic_collaboration_copy: 'Copy',
				geoResourceInfo_typeBadge_label_aggregate: 'Composition',
				geoResourceInfo_typeBadge_desc_aggregate: 'Description for Composition',
				geoResourceInfo_typeBadge_label_wms: 'WMS',
				geoResourceInfo_typeBadge_desc_wms: 'Description for WMS',
				geoResourceInfo_typeBadge_label_xyz: 'XYZ',
				geoResourceInfo_typeBadge_desc_xyz: 'Description for XYZ',
				geoResourceInfo_typeBadge_label_vector: 'Vector',
				geoResourceInfo_typeBadge_desc_vector: 'Description for Vector',
				geoResourceInfo_typeBadge_label_oaf: 'OAF',
				geoResourceInfo_typeBadge_desc_oaf: 'Description for OAF',
				geoResourceInfo_typeBadge_label_sta: 'STA',
				geoResourceInfo_typeBadge_desc_sta: 'Description for STA',
				geoResourceInfo_typeBadge_label_rtvector: 'RT',
				geoResourceInfo_typeBadge_desc_rtvector: 'Description for RT',
				geoResourceInfo_typeBadge_label_vt: 'VT',
				geoResourceInfo_typeBadge_desc_vt: 'Description for VT',
				geoResourceInfo_typeBadge_label_future: '?',
				geoResourceInfo_typeBadge_desc_future: 'The type of the geo-resource is not yet known'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				geoResourceInfo_empty_geoResourceInfo: 'Keine Ebenen-Information verfügbar',
				geoResourceInfo_geoResourceInfo_response_error: 'Die Ebenen-Information konnte nicht geladen werden',
				geoResourceInfo_last_modified_description: 'Diese GeoResource wurde mit der Zeichen- oder Messfunktion erstellt.',
				geoResourceInfo_last_modified_description_copy:
					'Wenn diese Zeichnung über einen Link mit Ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichnen- oder Messfunktion eine neue Zeichnung entstehen. Die ursprüngliche Zeichnung bleibt unverändert.',
				geoResourceInfo_last_modified_description_collaborative:
					'Wenn diese Zeichnung über einen Link mit Ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichnen- oder Messfunktion die ursprüngliche Zeichnung verändert.',
				geoResourceInfo_last_modified: 'Letzte Änderung',
				geoResourceInfo_infographic_collaboration_original: 'Original',
				geoResourceInfo_infographic_collaboration_copy: 'Kopie',
				geoResourceInfo_typeBadge_label_aggregate: 'Komposition',
				geoResourceInfo_typeBadge_desc_aggregate: 'Beschreibung des Typs Komposition',
				geoResourceInfo_typeBadge_label_wms: 'WMS',
				geoResourceInfo_typeBadge_desc_wms: 'Beschreibung des Typs WMS',
				geoResourceInfo_typeBadge_label_xyz: 'XYZ',
				geoResourceInfo_typeBadge_desc_xyz: 'Beschreibung des Typs XYZ',
				geoResourceInfo_typeBadge_label_vector: 'Vector',
				geoResourceInfo_typeBadge_desc_vector: 'Beschreibung des Typs Vector',
				geoResourceInfo_typeBadge_label_oaf: 'OAF',
				geoResourceInfo_typeBadge_desc_oaf: 'Beschreibung des Typs OAF',
				geoResourceInfo_typeBadge_label_sta: 'STA',
				geoResourceInfo_typeBadge_desc_sta: 'Beschreibung des Typs STA',
				geoResourceInfo_typeBadge_label_rtvector: 'RT',
				geoResourceInfo_typeBadge_desc_rtvector: 'Beschreibung des Typs RT',
				geoResourceInfo_typeBadge_label_vt: 'VT',
				geoResourceInfo_typeBadge_desc_vt: 'Beschreibung des Typs VT',
				geoResourceInfo_typeBadge_label_future: '?',
				geoResourceInfo_typeBadge_desc_future: 'Der Typ der GeoRessource ist noch nicht bekannt'
			};

		default:
			return {};
	}
};
