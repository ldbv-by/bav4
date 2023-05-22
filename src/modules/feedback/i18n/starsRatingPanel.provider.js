export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				fiveButtonRating_terrible: 'terrible',
				fiveButtonRating_bad: 'bad',
				fiveButtonRating_satisfied: 'satisfied',
				fiveButtonRating_good: 'good',
				fiveButtonRating_excellent: 'excellent'
			};

		case 'de':
			return {
				fiveButtonRating_terrible: 'schrecklich',
				fiveButtonRating_bad: 'schlecht',
				fiveButtonRating_satisfied: 'zufrieden',
				fiveButtonRating_good: 'gut',
				fiveButtonRating_excellent: 'ausgezeichnet'
			};

		default:
			return {};
	}
};
