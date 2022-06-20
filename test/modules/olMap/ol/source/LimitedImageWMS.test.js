import { getHeight, getWidth } from 'ol/extent';
import { getPrerenderFunctionForImageLayer, LimitedImageWMS } from '../../../../../src/modules/olMap/ol/source/LimitedImageWMS';
import { get as getProjection } from 'ol/proj.js';
import { ImageWMS } from 'ol/source';

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

describe('getPrerenderFunctionForImageLayer', () => {

	it('draws on the canvas when canvas size > maxSize', async () => {

		const source = new LimitedImageWMS({ maxSize: [2000, 2000] });
		const target = {
			getSource: () => source
		};
		const canvas = {
			width: 4000,
			height: 4000
		};
		const saveSpy = jasmine.createSpy();
		const beginPathSpy = jasmine.createSpy();
		const moveToSpy = jasmine.createSpy();
		const lineToSpy = jasmine.createSpy();
		const closePathSpy = jasmine.createSpy();
		const fillSpy = jasmine.createSpy();
		const restoreSpy = jasmine.createSpy();
		const ctx = {
			canvas: canvas,
			save: saveSpy,
			beginPath: beginPathSpy,
			moveTo: moveToSpy,
			lineTo: lineToSpy,
			closePath: closePathSpy,
			fill: fillSpy,
			restore: restoreSpy,
			fillStyle: null
		};
		const event = {
			target: target,
			context: ctx
		};
		const prerenderFunction = getPrerenderFunctionForImageLayer();

		prerenderFunction(event);

		expect(saveSpy).toHaveBeenCalledTimes(1);
		expect(beginPathSpy).toHaveBeenCalledTimes(1);
		expect(moveToSpy.calls.allArgs()).toEqual([[0, 0], [1000, 1000]]);
		expect(lineToSpy.calls.allArgs()).toEqual([[4000, 0], [4000, 4000], [0, 4000], [0, 0], [1000, 3000], [3000, 3000], [3000, 1000], [1000, 1000]]);
		expect(closePathSpy).toHaveBeenCalledTimes(2);
		expect(fillSpy).toHaveBeenCalledTimes(1);
		expect(ctx.fillStyle).toBe('rgba(0, 5, 25, 0.2)');
		expect(restoreSpy).toHaveBeenCalledTimes(1);
	});

	it('does NOT draws on the canvas when canvas size <= maxSize', async () => {

		const source = new LimitedImageWMS({ maxSize: [2000, 2000] });
		const target = {
			getSource: () => source
		};
		const canvas = {
			width: 2000,
			height: 2000
		};
		const saveSpy = jasmine.createSpy();
		const restoreSpy = jasmine.createSpy();
		const ctx = {
			canvas: canvas,
			save: saveSpy
		};
		const event = {
			target: target,
			context: ctx
		};
		const prerenderFunction = getPrerenderFunctionForImageLayer();

		prerenderFunction(event);

		expect(saveSpy).not.toHaveBeenCalled();
		expect(restoreSpy).not.toHaveBeenCalled();
	});

	it('does NOT draws on the canvas when source is not an LimitedImageWMS instance', async () => {

		const source = new ImageWMS();
		const target = {
			getSource: () => source
		};
		const canvas = {
			width: 4000,
			height: 4000
		};
		const saveSpy = jasmine.createSpy();
		const restoreSpy = jasmine.createSpy();
		const ctx = {
			canvas: canvas,
			save: saveSpy
		};
		const event = {
			target: target,
			context: ctx
		};
		const prerenderFunction = getPrerenderFunctionForImageLayer();

		prerenderFunction(event);

		expect(saveSpy).not.toHaveBeenCalled();
		expect(restoreSpy).not.toHaveBeenCalled();
	});
});
