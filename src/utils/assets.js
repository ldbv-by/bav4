/**
 * @module utils/assets
 */
const Asset_Svg_B64_Flag = 'data:image/svg+xml;base64,';

/**
 * @readonly
 * @enum {String}
 */
export const AssetSourceType = Object.freeze({
	LOCAL: 'local',
	REMOTE: 'remote',
	UNKNOWN: 'unknown'
});

/***
 * Determines the AssetSourceType of the specified asset source
 * @param {string} asset the asset source
 * @returns {AssetSourceType} the {@see AssetSourceType}
 */
export const getAssetSource = (asset) => {
	if (asset?.startsWith(Asset_Svg_B64_Flag)) {
		return AssetSourceType.LOCAL;
	}

	if (asset?.startsWith('http://') || asset?.startsWith('https://')) {
		return AssetSourceType.REMOTE;
	}
	return AssetSourceType.UNKNOWN;
};
