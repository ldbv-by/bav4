/**
 * @module modules/search/components/menu/types/resultPanelUtils
 */
export const requestData = async (term, provider, minQueryLength) => {
	if (term && term.trim().length >= minQueryLength) {
		try {
			const result = await provider(term);
			return result;
		} catch (error) {
			console.error(error);
		}
	}
	return [];
};
