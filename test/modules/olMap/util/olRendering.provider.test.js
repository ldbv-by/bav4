import { mapLibreRenderingProvider, mapLibreRenderMapProviderFunction } from '../../../../src/modules/olMap/utils/olRendering.provider';

describe('olRendering.provider', () => {
	describe('with mapLibreRenderingProvider', () => {
		it('does nothing for layer without mapLibre property object', async () => {
			const olLayer = {
				aProperty: 'foo',
				get: (key) => {
					switch (key) {
						case 'mapLibreOptions':
							return {};
						default:
							return null;
					}
				}
			};
			const mapExtent = [21, 21, 42, 42];
			const mapSize = [4, 2];

			const actual = await mapLibreRenderingProvider(olLayer, mapLibreRenderMapProviderFunction, mapExtent, mapSize);
			expect(actual).toBeNull();
		});

		it('does nothing for layer without mapLibreOptions property', async () => {
			const olLayer = {
				mapLibreMap: 'foo',
				get: (key) => {
					switch (key) {
						case 'mapLibreOptions':
							return null;
						default:
							return 'some';
					}
				}
			};
			const mapExtent = [21, 21, 42, 42];
			const mapSize = [4, 2];

			const actual = await mapLibreRenderingProvider(olLayer, mapLibreRenderMapProviderFunction, mapExtent, mapSize);
			expect(actual).toBeNull();
		});

		it('renders and encodes an image', async () => {
			const renderMapFactoryMock = jasmine.createSpy('renderMapFactoryMock').and.returnValue({
				getCanvas: () => {
					return { toDataURL: () => 'data:image/png;base64,TESTIMAGE' };
				},
				getBounds: () => {
					return {
						getWest: () => 1,
						getSouth: () => 2,
						getEast: () => 3,
						getNorth: () => 4
					};
				},
				once: (event, listener) => {
					if (event === 'idle') {
						listener();
					}
				},
				remove: () => {}
			});
			const mockRenderMapProviderFunction = () => {
				return renderMapFactoryMock;
			};

			const olLayer = {};
			const mapExtent = [10.942594795238621, 48.12636381169754, 12.932117268970822, 49.06185074195104];
			const mapSize = { width: 785, height: 529 };

			const dpiValues = [];
			const propertyGetSpy = spyOnProperty(window, 'devicePixelRatio', 'get').and.returnValue(1);
			spyOnProperty(window, 'devicePixelRatio', 'set').and.callFake((value) => dpiValues.push(value));

			await expectAsync(mapLibreRenderingProvider(olLayer, mockRenderMapProviderFunction, mapExtent, mapSize)).toBeResolvedTo({
				encodedImage: 'data:image/png;base64,TESTIMAGE',
				extent: [1, 2, 3, 4]
			});

			expect(renderMapFactoryMock).toHaveBeenCalledWith(olLayer, jasmine.any(HTMLElement), mapExtent);
			expect(propertyGetSpy).toHaveBeenCalledTimes(1);
			expect(dpiValues).toEqual([200 / 96, 1]);
		});
	});

	describe('with mapLibreRenderMapProviderFunction', () => {
		it('does nothing for layer without mapLibre property object', async () => {
			const olLayer = {
				aProperty: 'foo',
				get: (key) => {
					switch (key) {
						case 'mapLibreOptions':
							return {};
						default:
							return null;
					}
				}
			};
			const mapExtent = [21, 21, 42, 42];
			const renderContainer = document.createElement('div');

			const actual = mapLibreRenderMapProviderFunction();
			expect(actual(olLayer, renderContainer, mapExtent)).toBeNull();
		});

		it('does nothing for layer without mapLibreOptions property', async () => {
			const olLayer = {
				mapLibreMap: 'foo',
				get: (key) => {
					switch (key) {
						case 'mapLibreOptions':
							return null;
						default:
							return 'some';
					}
				}
			};
			const mapExtent = [21, 21, 42, 42];
			const renderContainer = document.createElement('div');

			const actual = mapLibreRenderMapProviderFunction();
			expect(actual(olLayer, renderContainer, mapExtent)).toBeNull();
		});

		it('returns the mapLibre map instance from the layer', async () => {
			const mockedMapLibreMapInstance = {
				getBearing: () => 0,
				getPitch: () => 0,
				_requestManager: () => {
					return { _transformRequestFn: () => {} };
				}
			};
			const olLayer = {
				mapLibreMap: mockedMapLibreMapInstance,
				get: (key) => {
					switch (key) {
						case 'mapLibreOptions':
							return { style: null };
						default:
							return 'some';
					}
				}
			};
			const mapExtent = [21, 21, 42, 42];
			const renderContainer = document.createElement('div');

			const actual = mapLibreRenderMapProviderFunction();
			expect(actual(olLayer, renderContainer, mapExtent)).toBeInstanceOf(Object);
		});
	});
});
