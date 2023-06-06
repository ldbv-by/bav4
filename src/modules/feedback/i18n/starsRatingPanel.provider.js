export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				fiveButtonRating_terrible: 'Very unlikely',
				fiveButtonRating_bad: 'Unlikely',
				fiveButtonRating_satisfied: 'Neutral',
				fiveButtonRating_good: 'Likely',
				fiveButtonRating_excellent: 'Very likely'
			};

		case 'de':
			return {
				fiveButtonRating_terrible: 'Sehr unwahrscheinlich',
				fiveButtonRating_bad: 'Unwahrscheinlich',
				fiveButtonRating_satisfied: 'Neutral',
				fiveButtonRating_good: 'Wahrscheinlich',
				fiveButtonRating_excellent: 'Sehr wahrscheinlich'
			};

		default:
			return {};
	}
};
