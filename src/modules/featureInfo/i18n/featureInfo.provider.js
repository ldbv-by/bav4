export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Close',
				featureInfo_header: 'Object Information',
				featureInfo_info: 'No information available.<br>Please click into the <b>map</b>.',
				featureInfo_featureCollection_add_feature: 'Dieses Feature zur Sammlung hinzufügen',
				featureInfo_featureCollection_remove_feature: 'Dieses Feature aus der Sammlung entfernen'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Schließen',
				featureInfo_header: 'Objekt-Info',
				featureInfo_info: 'Keine Informationen verfügbar.<br>Bitte in die <b>Karte</b> klicken.',
				featureInfo_featureCollection_add_feature: 'Add the feature to the collection',
				featureInfo_featureCollection_remove_feature: 'Remove the feature from the collection'
			};

		default:
			return {};
	}
};
