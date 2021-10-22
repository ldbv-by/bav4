/**
 * Uses the BVV style to extract a FeatureInfo from an olFeature.
 * @function
 * @param {coordinate} coordinate3857
 * @returns {number} altitude loaded from backend
 */
export const extractBvvFeatureInfo = (olFeature, layer) => {
	if (!olFeature.get('name') && !olFeature.get('description') && !olFeature.get('desc')) {
		return null;
	}

	const name = olFeature.get('name') ? `${olFeature.get('name')} - ${layer.label}` : `${layer.label}`;
	const content = olFeature.get('description') || olFeature.get('desc');
	return { title: name || null, content: content || null };
};
