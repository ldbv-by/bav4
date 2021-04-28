
export const requestData = async(term, provider, minQueryLength) => {
	if (term.trim().length >= minQueryLength) {
		try {
			const result = await provider(term);
			return result;
		}
		catch (error) {
			console.warn(error.message);
			return [];
		}
	}
	else {
		return [];
	}
};