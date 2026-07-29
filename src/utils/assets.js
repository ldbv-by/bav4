/**
 * @module utils/assets
 */
const Asset_Svg_Flag = 'data:image/svg+xml';
/**
 * Vite does not encode SVG as base64. See:
 * https://github.com/vitejs/vite/issues/1197#issuecomment-738780169
 * https://css-tricks.com/probably-dont-base64-svg/
 * https://github.com/vitejs/vite/issues/1204
 * */

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
	if (asset?.startsWith(Asset_Svg_Flag)) {
		return AssetSourceType.LOCAL;
	}

	if (asset?.startsWith('http://') || asset?.startsWith('https://')) {
		return AssetSourceType.REMOTE;
	}
	return AssetSourceType.UNKNOWN;
};
