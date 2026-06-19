export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_layerSwipeSlider: 'Move left or right',
				map_layerSwipeSlider_modal_title: 'Compare',
				map_layerSwipeSlider_modal_link_text: 'More Information',
				map_layerSwipeSlider_modal_link_url: 'https://www.ldbv.bayern.de/produkte/dienste/ba_hilfe/funktionen/vergleichen.html ',
				map_layerSwipeSlider_modal:
					'Please select one of the base maps below or a layer from the themes as your second map. To compare different years on the timeline, you must select the "Timeline" base map twice.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_layerSwipeSlider: 'Nach links oder rechts verschieben',
				map_layerSwipeSlider_modal_title: 'Vergleichen',
				map_layerSwipeSlider_modal_link_text: 'Weitere Informationen',
				map_layerSwipeSlider_modal_link_url: 'https://www.ldbv.bayern.de/produkte/dienste/ba_hilfe/funktionen/vergleichen.html ',
				map_layerSwipeSlider_modal:
					'Bitte wählen Sie als zweite Karte eine der untenstehenden Basiskarten oder eine Ebene aus den Themen. Um unterschiedliche Jahre der Zeitreise vergleichen zu können, muss die Basiskarte „Zeitreise“ zweimal ausgewählt werden.'
			};

		default:
			return {};
	}
};
