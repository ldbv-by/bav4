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
				geoResourceInfo_typeBadge_desc_aggregate: 'A layer composed of several map layers',
				geoResourceInfo_typeBadge_label_wms: 'WMS',
				geoResourceInfo_typeBadge_desc_wms: 'The layer is provided via an OGC-compliant Web Map Service',
				geoResourceInfo_typeBadge_label_xyz: 'XYZ-Tiles',
				geoResourceInfo_typeBadge_desc_xyz: 'The layer is provided via a Web Map Tile Service in XYZ format',
				geoResourceInfo_typeBadge_label_vector: 'Vector',
				geoResourceInfo_typeBadge_desc_vector: 'The layer is based on a KML, GPX, EWKT, or GeoJSON file, or on a drawing',
				geoResourceInfo_typeBadge_label_oaf: 'OAF',
				geoResourceInfo_typeBadge_desc_oaf: 'The layer is based on the OGC API - Features standard',
				geoResourceInfo_typeBadge_label_sta: 'STA',
				geoResourceInfo_typeBadge_desc_sta: 'The layer is based on the OGC SensorThings API standard',
				geoResourceInfo_typeBadge_label_rtvector: 'RT',
				geoResourceInfo_typeBadge_desc_rtvector: 'The layer is updated in real time',
				geoResourceInfo_typeBadge_label_vt: 'VT',
				geoResourceInfo_typeBadge_desc_vt: 'The layer is provided by a vector tiles service',
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
				geoResourceInfo_typeBadge_desc_aggregate: 'Eine Ebene, die sich aus mehreren Kartenebenen zusammensetzt',
				geoResourceInfo_typeBadge_label_wms: 'WMS',
				geoResourceInfo_typeBadge_desc_wms: 'Die Ebene wird durch einen OGC-konformen Web Map Service bereitgestellt',
				geoResourceInfo_typeBadge_label_xyz: 'XYZ-Kacheln',
				geoResourceInfo_typeBadge_desc_xyz: 'Die Ebene wird durch einen Web Map Tile Service im Format XYZ bereitgestellt',
				geoResourceInfo_typeBadge_label_vector: 'Vektor',
				geoResourceInfo_typeBadge_desc_vector: 'Die Ebene basiert auf einer KML-, GPX-, EWKT- oder GeoJSON-Datei oder einer Zeichnung',
				geoResourceInfo_typeBadge_label_oaf: 'OAF',
				geoResourceInfo_typeBadge_desc_oaf: 'Die Ebene basiert auf dem Standard OGC API - Features',
				geoResourceInfo_typeBadge_label_sta: 'STA',
				geoResourceInfo_typeBadge_desc_sta: 'Die Ebene basiert auf dem OGC SensorThings API Standard',
				geoResourceInfo_typeBadge_label_rtvector: 'RT',
				geoResourceInfo_typeBadge_desc_rtvector: 'Die Ebene wird in Echtzeit (real time) aktualisiert',
				geoResourceInfo_typeBadge_label_vt: 'VT',
				geoResourceInfo_typeBadge_desc_vt: 'Die Ebene wird durch einen Vector-Tiles-Dienst bereitgestellt',
				geoResourceInfo_typeBadge_label_future: '?',
				geoResourceInfo_typeBadge_desc_future: 'Der Typ der GeoRessource ist noch nicht bekannt'
			};

		default:
			return {};
	}
};
