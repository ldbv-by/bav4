
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				featureInfoPlugin_featureInfoService_exception: 'FeatureInfo could not be retrieved'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				featureInfoPlugin_featureInfoService_exception: 'FeatureInfo Abfrage schlug fehl'
			};

		default:
			return {};
	}
};
