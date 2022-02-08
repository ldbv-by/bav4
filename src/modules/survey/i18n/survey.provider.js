export const surveyProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				survey_feedback: 'Survey'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				survey_feedback: 'Umfrage'
			};

		default:
			return {};
	}
};
