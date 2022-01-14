export const contextLinkProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				contextlink_feedback: 'Feedback'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				contextlink_feedback: 'Feedback'
			};

		default:
			return {};
	}
};
