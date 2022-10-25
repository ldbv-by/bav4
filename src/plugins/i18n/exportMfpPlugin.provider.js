
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				exportMfpPlugin_mfpService_createJob_exception: 'PDF generation was not successful.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				exportMfpPlugin_mfpService_createJob_exception: 'PDF konnte nicht erstellt werden.'
			};

		default:
			return {};
	}
};
