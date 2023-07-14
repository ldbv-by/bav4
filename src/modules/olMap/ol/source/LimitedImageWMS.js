/**
 * @module modules/olMap/ol/source/LimitedImageWMS
 */
import ImageWMS from 'ol/source/ImageWMS';

/**
 * @typedef {Object} Options
 * @property {Array<number>} [maxSize=[2000, 2000]] maximum width and height of the requested image in px. Default is 2000*2000.
 */

/**
 * Source for WMS servers providing single, un-tiled images.
 * The requested maximum width and height of the image is limited to a configurable size (default is 2000x2000).
 * If width and/or height exceed the configured maximum size, the image will be scaled.
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

		super.setImageLoadFunction((image, src) => {
			const params = new URLSearchParams(src.split('?')[1]);
			const width = parseInt(params.get('WIDTH'));
			const height = parseInt(params.get('HEIGHT'));
			const scalingWidth = this._maxSize[0] / width;
			const scalingHeight = this._maxSize[1] / height;
			if (scalingWidth >= 1 && scalingHeight >= 1) {
				image.getImage().src = src;
			} else {
				params.set('WIDTH', `${scalingWidth >= 1 ? width : Math.round(width * scalingWidth)}`);
				params.set('HEIGHT', `${scalingHeight >= 1 ? height : Math.round(height * scalingHeight)}`);
				const url = `${src.split('?')[0]}?${params.toString()}`;
				const tempImage = document.createElement('img');
				tempImage.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext('2d');
					ctx.drawImage(tempImage, 0, 0, width, height);
					image.getImage().src = canvas.toDataURL();
				};
				tempImage.crossOrigin = 'anonymous';
				tempImage.src = url;
			}
		});
	}

	getMaxSize() {
		return this._maxSize;
	}
}

/**
 * Returns a function drawing a rectangular to visualize the max. size of the current image layer.
 */
export const getPrerenderFunctionForImageLayer = () => {
	return (evt) => {
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
