import ImageWMS from 'ol/source/ImageWMS';
import { getWidth, getHeight } from 'ol/extent';

/**
 * @typedef {Object} Options
 * @property {Array<number>} [maxSize=[2000, 2000]] maximum width and height of the requested image in px. Default is 2000*2000.
 */

/**
 * Source for WMS servers providing single, untiled images.
 * The requested maximum width and height of the image is limited to a configurable size.
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
		 * If the current extent would result in a dimension greater than the configured maximum size,
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


/**
 * Returns a function drawing a rectangular to visualize the max. size of the current image layer.
 */
export const getPrerenderFunctionForImageLayer = () => {
	return 	(evt) => {

		const ctx = evt.context;
		if (evt.target.getSource() instanceof LimitedImageWMS) {
			const width = ctx.canvas.width;
			const height = ctx.canvas.height;
			const maxWmsWidth = evt.target.getSource().getMaxSize()[0];
			const maxWmsHeight = evt.target.getSource().getMaxSize()[1];
			if (width > maxWmsWidth || height > maxWmsHeight) {
				const minx = width / 2 - maxWmsWidth / 2;
				const maxx = width / 2 + maxWmsWidth / 2;
				const miny = height / 2 - maxWmsHeight / 2;
				const maxy = height / 2 + maxWmsHeight / 2;
				ctx.save();
				ctx.beginPath();
				// outside polygon, must be clockwise
				ctx.moveTo(0, 0);
				ctx.lineTo(width, 0);
				ctx.lineTo(width, height);
				ctx.lineTo(0, height);
				ctx.lineTo(0, 0);
				ctx.closePath();

				// inner polygon, must be counter-clockwise
				ctx.moveTo(minx, miny);
				ctx.lineTo(minx, maxy);
				ctx.lineTo(maxx, maxy);
				ctx.lineTo(maxx, miny);
				ctx.lineTo(minx, miny);
				ctx.closePath();

				ctx.fillStyle = 'rgba(0, 5, 25, 0.2)';
				ctx.fill();

				ctx.restore();
			}
		}
	};
};

