export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				fiveButtonRating_very_unlikely: 'Very unlikely',
				fiveButtonRating_unlikely: 'Unlikely',
				fiveButtonRating_neutral: 'Neutral',
				fiveButtonRating_likely: 'Likely',
				fiveButtonRating_very_likely: 'Very likely'
			};

		case 'de':
			return {
				fiveButtonRating_very_unlikely: 'Sehr unwahrscheinlich',
				fiveButtonRating_unlikely: 'Unwahrscheinlich',
				fiveButtonRating_neutral: 'Neutral',
				fiveButtonRating_likely: 'Wahrscheinlich',
				fiveButtonRating_very_likely: 'Sehr wahrscheinlich'
			};

		default:
			return {};
	}
};
