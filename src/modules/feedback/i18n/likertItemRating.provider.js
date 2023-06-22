export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				likertItem_response_very_unlikely: 'Very unlikely',
				likertItem_response_unlikely: 'Unlikely',
				likertItem_response_neutral: 'Neutral',
				likertItem_response_likely: 'Likely',
				likertItem_response_very_likely: 'Very likely'
			};

		case 'de':
			return {
				likertItem_response_very_unlikely: 'Sehr unwahrscheinlich',
				likertItem_response_unlikely: 'Unwahrscheinlich',
				likertItem_response_neutral: 'Neutral',
				likertItem_response_likely: 'Wahrscheinlich',
				likertItem_response_very_likely: 'Sehr wahrscheinlich'
			};

		default:
			return {};
	}
};
