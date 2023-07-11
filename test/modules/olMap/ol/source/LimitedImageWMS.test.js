import { getPrerenderFunctionForImageLayer, LimitedImageWMS } from '../../../../../src/modules/olMap/ol/source/LimitedImageWMS';
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

	describe('imageLoadFunction', () => {
		describe('when NO scaling is needed', () => {
			it('just set the "src" of the image', async () => {
				const instanceUnderTest = new LimitedImageWMS();
				const imageLoadFunction = instanceUnderTest.getImageLoadFunction();
				const mockImage = { src: null };
				const mockImageWrapper = {
					getImage: () => mockImage
				};
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';

				imageLoadFunction(mockImageWrapper, src);

				expect(mockImageWrapper.getImage().src).toBe(src);
			});
		});

		describe('when scaling is needed', () => {
			describe('for WIDTH', () => {
				it('scales the image using a canvas element', async () => {
					const instanceUnderTest = new LimitedImageWMS();
					const imageLoadFunction = instanceUnderTest.getImageLoadFunction();
					const mockImage = { src: null };
					const mockImageWrapper = {
						getImage: () => mockImage
					};
					const mockTempImage = {};
					const mockCanvasDataURL = 'canvasDataUrl';
					const mockCanvasContext = { drawImage: () => {} };
					const drawImageSpy = spyOn(mockCanvasContext, 'drawImage');
					const mockCanvas = { getContext: () => {}, toDataURL: () => {} };
					spyOn(mockCanvas, 'getContext').withArgs('2d').and.returnValue(mockCanvasContext);
					spyOn(mockCanvas, 'toDataURL').and.returnValue(mockCanvasDataURL);
					spyOn(document, 'createElement').and.callFake((tag) => {
						switch (tag) {
							case 'img':
								return mockTempImage;
							case 'canvas':
								return mockCanvas;
						}
					});
					const originalSrc = 'http://foo.var?WIDTH=2001&HEIGHT=2000';

					imageLoadFunction(mockImageWrapper, originalSrc);

					expect(mockTempImage.crossOrigin).toBe('anonymous');
					expect(mockTempImage.src).toBe('http://foo.var?WIDTH=2000&HEIGHT=2000');
					mockTempImage.onload();
					expect(mockCanvas.width).toBe(2001);
					expect(mockCanvas.height).toBe(2000);
					expect(mockImageWrapper.getImage().src).toBe(mockCanvasDataURL);
					expect(drawImageSpy).toHaveBeenCalledWith(mockTempImage, 0, 0, 2001, 2000);
				});
			});

			describe('for HEIGHT', () => {
				it('scales the image using a canvas element', async () => {
					const instanceUnderTest = new LimitedImageWMS();
					const imageLoadFunction = instanceUnderTest.getImageLoadFunction();
					const mockImage = { src: null };
					const mockImageWrapper = {
						getImage: () => mockImage
					};
					const mockTempImage = {};
					const mockCanvasDataURL = 'canvasDataUrl';
					const mockCanvasContext = { drawImage: () => {} };
					const drawImageSpy = spyOn(mockCanvasContext, 'drawImage');
					const mockCanvas = { getContext: () => {}, toDataURL: () => {} };
					spyOn(mockCanvas, 'getContext').withArgs('2d').and.returnValue(mockCanvasContext);
					spyOn(mockCanvas, 'toDataURL').and.returnValue(mockCanvasDataURL);
					spyOn(document, 'createElement').and.callFake((tag) => {
						switch (tag) {
							case 'img':
								return mockTempImage;
							case 'canvas':
								return mockCanvas;
						}
					});
					const originalSrc = 'http://foo.var?WIDTH=2000&HEIGHT=2001';

					imageLoadFunction(mockImageWrapper, originalSrc);

					expect(mockTempImage.crossOrigin).toBe('anonymous');
					expect(mockTempImage.src).toBe('http://foo.var?WIDTH=2000&HEIGHT=2000');
					mockTempImage.onload();
					expect(mockCanvas.width).toBe(2000);
					expect(mockCanvas.height).toBe(2001);
					expect(mockImageWrapper.getImage().src).toBe(mockCanvasDataURL);
					expect(drawImageSpy).toHaveBeenCalledWith(mockTempImage, 0, 0, 2000, 2001);
				});
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
		expect(moveToSpy.calls.allArgs()).toEqual([
			[0, 0],
			[1000, 1000]
		]);
		expect(lineToSpy.calls.allArgs()).toEqual([
			[4000, 0],
			[4000, 4000],
			[0, 4000],
			[0, 0],
			[1000, 3000],
			[3000, 3000],
			[3000, 1000],
			[1000, 1000]
		]);
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
