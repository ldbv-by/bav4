export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_layerSwipeSlider: 'Move left or right'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_layerSwipeSlider: 'Nach links oder rechts verschieben'
			};

		default:
			return {};
	}
};
