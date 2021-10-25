/**
 * BVV strategy to extract a FeatureInfo item from an olFeature.
 * @function
 * @param {coordinate} coordinate3857
 * @returns {number} altitude loaded from backend
 */
export const getBvvFeatureInfo = (olFeature, layer) => {
	if (!olFeature.get('name') && !olFeature.get('description') && !olFeature.get('desc')) {
		return null;
	}

	const name = olFeature.get('name') ? `${olFeature.get('name')} - ${layer.label}` : `${layer.label}`;
	const content = olFeature.get('description') || olFeature.get('desc');
	return { title: name, content: content || null };
};
