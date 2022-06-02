import { getHeight, getWidth } from 'ol/extent';
import { LimitedImageWMS } from '../../../../../src/modules/olMap/ol/source/LimitedImageWMS';
import { get as getProjection } from 'ol/proj.js';

describe('LimitedImageWMS', () => {

	describe('constructor', () => {

		it('initializes an instance with default params', async () => {

			const instanceUnderTest = new LimitedImageWMS();

			expect(instanceUnderTest._maxSize).toEqual([2000, 2000]);
		});

		it('initializes an instance with custom params', async () => {

			const instanceUnderTest = new LimitedImageWMS({ maxSize: [42, 42], ratio: 5 });

			expect(instanceUnderTest._maxSize).toEqual([42, 42]);
			expect(instanceUnderTest.ratio_).toBe(5);
		});
	});

	describe('#getMaxSize', () => {

		it('returns the current max size', async () => {

			const instanceUnderTest = new LimitedImageWMS();

			expect(instanceUnderTest.getMaxSize()).toEqual([2000, 2000]);
		});
	});

	describe('#getImage', () => { // #getImage tests are adopted from ol.ImageWMS

		it('returns the expected image URL', () => {
			const pixelRatio = 1;
			const projection = getProjection('EPSG:4326');
			const resolution = 1;
			[1, 1.5].forEach(function (ratio) {
				const options = {
					params: {
						'LAYERS': 'layer'
					},
					ratio: ratio,
					url: 'http://example.com/wms'
				};
				const source = new LimitedImageWMS(options);
				const viewExtent = [10, 20, 30.1, 39.9];
				const viewWidth = getWidth(viewExtent);
				const viewHeight = getHeight(viewExtent);

				const image = source.getImage(
					viewExtent,
					resolution,
					pixelRatio,
					projection
				);

				const uri = new URL(image.src_);
				const queryData = uri.searchParams;
				const imageWidth = Number(queryData.get('WIDTH'));
				const imageHeight = Number(queryData.get('HEIGHT'));
				const bbox = queryData.get('BBOX').split(',').map(Number);
				const bboxAspectRatio = (bbox[3] - bbox[1]) / (bbox[2] - bbox[0]);
				const imageAspectRatio = imageWidth / imageHeight;
				expect(imageWidth).toBe(Math.ceil((viewWidth / resolution) * ratio));
				expect(imageHeight).toBe(Math.ceil((viewHeight / resolution) * ratio));
				expect(bboxAspectRatio).toBeCloseTo(imageAspectRatio, 1e-12);
			});
		});

		it('returns the expected image URL containing re-calculated WIDTH and HEIGHT params', () => {
			const maxSize = [5, 6];
			const pixelRatio = 1;
			const projection = getProjection('EPSG:4326');
			const resolution = 0.1;
			[1, 1.5].forEach(function (ratio) {
				const options = {
					params: {
						'LAYERS': 'layer'
					},
					ratio: ratio,
					url: 'http://example.com/wms',
					maxSize: maxSize
				};
				const source = new LimitedImageWMS(options);
				const viewExtent = [10, 20, 30.1, 39.9];

				const image = source.getImage(
					viewExtent,
					resolution,
					pixelRatio,
					projection
				);

				const uri = new URL(image.src_);
				const queryData = uri.searchParams;
				const imageWidth = Number(queryData.get('WIDTH'));
				const imageHeight = Number(queryData.get('HEIGHT'));
				const bbox = queryData.get('BBOX').split(',').map(Number);
				const bboxAspectRatio = (bbox[3] - bbox[1]) / (bbox[2] - bbox[0]);
				const imageAspectRatio = imageWidth / imageHeight;
				expect(imageWidth).toBe(maxSize[0]);
				expect(imageHeight).toBe(maxSize[1]);
				expect(bboxAspectRatio).toBeCloseTo(imageAspectRatio, 1e-12);
			});
		});
	});
});
