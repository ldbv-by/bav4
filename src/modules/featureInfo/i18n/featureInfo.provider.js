export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Close',
				featureInfo_header: 'Object Information',
				featureInfo_info: 'No information available.<br>Please click into the <b>map</b>.',
				featureInfo_featureCollection_add_feature: 'Add to collection',
				featureInfo_featureCollection_remove_feature: 'Remove from collection',
				featureInfo_featureCollection_add_feature_title: 'Add this object to “My temporary collection”',
				featureInfo_featureCollection_remove_feature_title: 'Remove this object from “My temporary collection”',
				featureInfo_featureCollection_add_feature_notification: 'Object was added to “My temporary collection”',
				featureInfo_featureCollection_remove_feature_notification: 'Object has been removed from “My temporary collection”'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				featureInfo_close_button: 'Schließen',
				featureInfo_header: 'Objekt-Info',
				featureInfo_info: 'Keine Informationen verfügbar.<br>Bitte in die <b>Karte</b> klicken.',
				featureInfo_featureCollection_add_feature: 'Zur Sammlung hinzufügen',
				featureInfo_featureCollection_remove_feature: 'Aus Sammlung entfernen',
				featureInfo_featureCollection_add_feature_title: 'Dieses Objekt zu "Meine temporäre Sammlung" hinzufügen',
				featureInfo_featureCollection_remove_feature_title: 'Dieses Objekt aus "Meine temporäre Sammlung" entfernen',
				featureInfo_featureCollection_add_feature_notification: 'Objekt wurde zu "Meine temporäre Sammlung" hinzugefügt',
				featureInfo_featureCollection_remove_feature_notification: 'Objekt wurde aus "Meine temporäre Sammlung" entfernt'
			};

		default:
			return {};
	}
};
