import ImageWMS from 'ol/source/ImageWMS';
import { getWidth, getHeight } from 'ol/extent';

/**
 * @typedef {Object} Options
 * @property {Array<number>} [maxSize=[2000, 2000]] max. width and height of the requested image in px. Default is 2000*2000.
 */

/**
 * Source for WMS servers providing single, untiled images.
 * The requested max. width and height of the image is limited to a configurable size.
 * @class
 * @author taulinger
 */
export class LimitedImageWMS extends ImageWMS {

	/**
	 *
	 * @param {Options} opt_options
	 */
	constructor(opt_options = {}) {
		super(opt_options);
		this._maxSize = opt_options.maxSize ?? [2000, 2000];
	}

	getMaxSize() {
		return this._maxSize;
	}

	/**
	 * @override
	 */
	getImage(extent, resolution, pixelRatio, projection) {

		/**
		 * If the current extent would result in a dimension greater than max. size,
		 * we calculate a cropped extent.
		 */
		const imageResolution = resolution / pixelRatio;

		const widthPx = getWidth(extent) / imageResolution * this.ratio_;
		const width = widthPx > this._maxSize[0] ? this._maxSize[0] * imageResolution / this.ratio_ : getWidth(extent);

		const heightPx = getHeight(extent) / imageResolution * this.ratio_;
		const height = heightPx > this._maxSize[1] ? this._maxSize[1] * imageResolution / this.ratio_ : getHeight(extent);

		const centerX = (extent[0] + extent[2]) / 2;
		const centerY = (extent[1] + extent[3]) / 2;

		extent[0] = centerX - width / 2;
		extent[2] = centerX + width / 2;
		extent[1] = centerY - height / 2;
		extent[3] = centerY + height / 2;

		return super.getImage(extent, resolution, pixelRatio, projection);
	}
}

