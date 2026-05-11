import { MapService } from '@src/services/MapService';
import { $injector } from '@src/injection';
import { equals } from '@src/utils/storeUtils';

describe('MapService', () => {
	const coordinateServiceMock = {
		fromLonLatExtent() {},
		toLonLatExtent() {},
		toLonLat() {},
		containsCoordinate() {},
		toCoordinate(c) {
			return c;
		},
		transform() {},
		getLength() {},
		getArea() {}
	};

	beforeAll(() => {
		$injector.registerSingleton('CoordinateService', coordinateServiceMock);
	});

	const getTestDefinitionProvider = () => {
		return {
			defaultExtent: [0, 1, 2, 3],
			localProjectedSridExtent: [4, 5, 6, 7],
			srid: 3857,
			localProjectedCoordinateRepresentations: () => [{ label: 'Local projected SRID', code: 9999 }],
			globalCoordinateRepresentations: [{ label: 'Global SRID', code: 1111 }],
			localProjectedSrid: 9999,
			minZoomLevel: 5,
			maxZoomLevel: 21
		};
	};

	const setup = (definitionsProvider = getTestDefinitionProvider) => {
		return new MapService(definitionsProvider);
	};

	describe('constructor', () => {
		it('sets default providers', async () => {
			const service = new MapService();

			expect(service._definitions).toBeDefined();
		});
	});

	describe('provides an extent', () => {
		it('for 3857', () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest.getDefaultMapExtent()).toEqual([0, 1, 2, 3]);
		});

		it('for 4326', () => {
			const instanceUnderTest = setup();
			const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'toLonLatExtent').mockReturnValue([4, 5, 6, 7]);

			expect(instanceUnderTest.getDefaultMapExtent(4326)).toEqual([4, 5, 6, 7]);
			expect(coordinateServiceSpy).toHaveBeenCalledWith([0, 1, 2, 3]);
		});

		it('throws an exception for a unsupported SRID', () => {
			const instanceUnderTest = setup();

			expect(() => {
				instanceUnderTest.getDefaultMapExtent(21);
			}).toThrowError(/Unsupported SRID 21/);
		});
	});

	describe('provides the extent of the local projected system', () => {
		it('for 3857', () => {
			const instanceUnderTest = setup();
			const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'fromLonLatExtent').mockReturnValue([0, 1, 2, 3]);

			expect(instanceUnderTest.getLocalProjectedSridExtent()).toEqual([0, 1, 2, 3]);
			expect(coordinateServiceSpy).toHaveBeenCalledWith([4, 5, 6, 7]);
		});

		it('for 4326', () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest.getLocalProjectedSridExtent(4326)).toEqual([4, 5, 6, 7]);
		});

		it('throws an exception for an unsupported SRID', () => {
			const instanceUnderTest = setup();

			expect(() => {
				instanceUnderTest.getLocalProjectedSridExtent(21);
			}).toThrowError(/Unsupported SRID 21/);
		});
	});

	describe('returns a list with all SRID definitions', () => {
		describe('called without argument', () => {
			it('provides an array of global SRID definitions', () => {
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue([5, -80, 14, 80]);

				expect(instanceUnderTest.getCoordinateRepresentations()).toEqual([{ label: 'Global SRID', code: 1111 }]);
			});
		});

		describe('called with a coordinate like', () => {
			it('provides an array of global SRID definitions when local projected extent is not defined', () => {
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(null);

				expect(instanceUnderTest.getCoordinateRepresentations([0, 0])).toEqual([{ label: 'Global SRID', code: 1111 }]);
			});

			it('provides an array of local projected SRID definitions when coordinate is within local projected extent', () => {
				const coordinate = [0, 0];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const localProjectedCoordinateRepresentationsFnSpy = vi.fn().mockReturnValue([{ label: 'Local projected SRID', code: 9999 }]);
				const defProvider = () => ({
					localProjectedCoordinateRepresentations: localProjectedCoordinateRepresentationsFnSpy
				});

				const instanceUnderTest = setup(defProvider);
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockReturnValue(true);

				expect(instanceUnderTest.getCoordinateRepresentations(coordinate)).toEqual([{ label: 'Local projected SRID', code: 9999 }]);
				expect(localProjectedCoordinateRepresentationsFnSpy).toHaveBeenCalledWith(coordinate);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(localProjectedSridExtent, coordinate);
			});

			it('provides an array of global SRID definitions when when coordinate is outside local projected extent', () => {
				const coordinate = [0, 0];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockReturnValue(false);

				expect(instanceUnderTest.getCoordinateRepresentations(coordinate)).toEqual([{ label: 'Global SRID', code: 1111 }]);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(localProjectedSridExtent, coordinate);
			});
		});

		describe('called with an array of coordinate like', () => {
			it('provides an array of global SRID definitions when local projected extent is not defined', () => {
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(null);

				expect(
					instanceUnderTest.getCoordinateRepresentations([
						[0, 0],
						[1, 1]
					])
				).toEqual([{ label: 'Global SRID', code: 1111 }]);
			});

			it('provides an array of local projected SRID definitions when all coordinates are within local projected extent', () => {
				const coordinates = [
					[0, 0],
					[1, 1]
				];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const localProjectedCoordinateRepresentationsFnSpy = vi.fn().mockReturnValue([{ label: 'Local projected SRID', code: 9999 }]);
				const defProvider = () => ({
					localProjectedCoordinateRepresentations: localProjectedCoordinateRepresentationsFnSpy
				});
				const instanceUnderTest = setup(defProvider);
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockReturnValue(true);

				expect(instanceUnderTest.getCoordinateRepresentations(coordinates)).toEqual([{ label: 'Local projected SRID', code: 9999 }]);
				expect(localProjectedCoordinateRepresentationsFnSpy).toHaveBeenCalledWith(coordinates[0]);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(localProjectedSridExtent, expect.any(Array));
			});

			it('provides an array of global SRID definitions when one or more coordinate are outside local projected extent', () => {
				const coordinates = [
					[0, 0],
					[100, 100]
				];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockImplementation((_, c) => {
					if (equals(c, [100, 100])) {
						return false;
					}
					return true;
				});

				expect(instanceUnderTest.getCoordinateRepresentations(coordinates)).toEqual([{ label: 'Global SRID', code: 1111 }]);
			});
		});
	});

	it('provides the internal SRID of the map', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getSrid()).toBe(3857);
	});

	it('provides the SRID of the local projected system', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getLocalProjectedSrid()).toBe(9999);
	});

	it('provides the min zoom level', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getMinZoomLevel()).toBe(5);
	});

	it('provides the max zoom level', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getMaxZoomLevel()).toBe(21);
	});

	it('provides minimal angle for rotation', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getMinimalRotation()).toBe(0.3);
	});

	describe('calcResolution', () => {
		it('calculates the resolution using default arguments', () => {
			const expectedResolution = 3273.3667254226675;
			const mock3857Coordinate = [0, 1];
			const mock4326Coordinate = [11, 48];
			const zoomLevel = 5;
			const srid = 3857;
			const instanceUnderTest = setup();
			vi.spyOn(instanceUnderTest, 'getSrid').mockReturnValue(srid);
			const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'toLonLat').mockReturnValue(mock4326Coordinate);

			expect(instanceUnderTest.calcResolution(zoomLevel, mock3857Coordinate)).toBeCloseTo(expectedResolution, 3);
			expect(coordinateServiceSpy).toHaveBeenCalledWith([0, 1]);
		});

		it('calculates the resolution', () => {
			const expectedResolution = 3273.3667254226675;
			const mock3857Coordinate = [0, 1];
			const mock4326Coordinate = [11, 48];
			const zoomLevel = 5;
			const srid = 3857;
			const tileSize = 256;
			const instanceUnderTest = setup();
			const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'toLonLat').mockReturnValue(mock4326Coordinate);

			expect(instanceUnderTest.calcResolution(zoomLevel, mock3857Coordinate, srid, tileSize)).toBeCloseTo(expectedResolution, 3);
			expect(coordinateServiceSpy).toHaveBeenCalledWith([0, 1]);
		});

		describe('and 3857 coordinate is missing', () => {
			it('throws an error ', () => {
				const zoomLevel = 5;
				const srid = 3857;
				const instanceUnderTest = setup();

				expect(() => instanceUnderTest.calcResolution(zoomLevel)).toThrowError(
					`Parameter 'coordinateInMapProjection' must not be Null when using SRID ${srid}`
				);
			});
		});

		describe('and srid is not supported', () => {
			it('throws an error ', () => {
				const srid = -1;
				const zoomLevel = 5;
				const instanceUnderTest = setup();
				vi.spyOn(instanceUnderTest, 'getSrid').mockReturnValue(srid);

				expect(() => instanceUnderTest.calcResolution(zoomLevel)).toThrowError(`Unsupported SRID ${srid}`);
			});
		});
	});

	describe('getScaleLineContainer', () => {
		it('returns an HTMLElement when available', () => {
			const mockFooter = {
				shadowRoot: {
					querySelector() {}
				}
			};
			const mockHTMElement = {};
			const documentSpy = vi.spyOn(document, 'querySelector').mockReturnValue(mockFooter);
			const mockFooterSpy = vi.spyOn(mockFooter.shadowRoot, 'querySelector').mockReturnValue(mockHTMElement);
			const instanceUnderTest = setup();

			const element = instanceUnderTest.getScaleLineContainer();

			expect(document.querySelector).toHaveBeenCalled();
			expect(mockFooter.shadowRoot.querySelector).toHaveBeenCalled();
			expect(element).toEqual(mockHTMElement);
			expect(documentSpy).toHaveBeenCalledWith('ba-footer');
			expect(mockFooterSpy).toHaveBeenCalledWith('.scale');
		});

		it('returns null when element is not available', () => {
			const documentSpy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
			const instanceUnderTest = setup();

			const element = instanceUnderTest.getScaleLineContainer();

			expect(documentSpy).toHaveBeenCalledWith('ba-footer');
			expect(element).toBeNull();
		});
	});

	describe('getVisibleViewport', () => {
		it('returns a visible viewportPadding', () => {
			document.body.innerHTML =
				'<div id="overlapping1" data-register-for-viewport-calc></div>' +
				'<div id="non-overlapping"></div>' +
				'<div id="overlapping2" data-register-for-viewport-calc></div>';
			const overlappingElement1 = document.getElementById('overlapping1');
			const overlappingElement2 = document.getElementById('overlapping2');
			const nonOverlappingElement = document.getElementById('non-overlapping');
			const spy1 = vi.spyOn(overlappingElement1, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect());
			const spy2 = vi.spyOn(overlappingElement2, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect());
			const spy3 = vi.spyOn(nonOverlappingElement, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect());
			const mapElementMock = { getBoundingClientRect: () => DOMRect.fromRect() };
			const instanceUnderTest = setup();

			const visibleViewPort = instanceUnderTest.getVisibleViewport(mapElementMock);

			expect(visibleViewPort).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
			expect(spy1).toHaveBeenCalled();
			expect(spy2).toHaveBeenCalled();
			expect(spy3).not.toHaveBeenCalled();
		});

		describe('returns a visible viewportPadding relative to the mapElement', () => {
			const mapElementMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 50, y: 50, width: 500, height: 500 }) };

			it('with a leftSideElement and a bottomElement', () => {
				document.body.innerHTML =
					'<div id="leftSideElement" data-register-for-viewport-calc></div>' +
					'<div id="non-overlapping"></div>' +
					'<div id="bottomElement" data-register-for-viewport-calc></div>';
				const leftSideElement = document.getElementById('leftSideElement');
				const bottomElement = document.getElementById('bottomElement');
				vi.spyOn(leftSideElement, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 50, y: 50, width: 50, height: 550 }));
				vi.spyOn(bottomElement, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 100, y: 500, width: 450, height: 50 }));
				const instanceUnderTest = setup();

				const visibleViewPort = instanceUnderTest.getVisibleViewport(mapElementMock);

				expect(visibleViewPort).toEqual({ top: 0, right: 0, bottom: 50, left: 50 });
			});

			it('with a rightSideElement and a topElement', () => {
				document.body.innerHTML =
					'<div id="rightSideElement" data-register-for-viewport-calc></div>' +
					'<div id="non-overlapping"></div>' +
					'<div id="topElement" data-register-for-viewport-calc></div>';
				const rightSideElement = document.getElementById('rightSideElement');
				const topElement = document.getElementById('topElement');
				vi.spyOn(rightSideElement, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 500, y: 50, width: 50, height: 550 }));
				vi.spyOn(topElement, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 50, y: 50, width: 450, height: 50 }));
				const instanceUnderTest = setup();

				const visibleViewPort = instanceUnderTest.getVisibleViewport(mapElementMock);

				expect(visibleViewPort).toEqual({ top: 50, right: 50, bottom: 0, left: 0 });
			});
		});
	});

	describe('calcArea', () => {
		describe('no projected extent available', () => {
			it('calculates the area by calling the OlCoordinateService', () => {
				const instanceUnderTest = setup();
				const coordinateInMapProjection = [
					[
						[8, 8],
						[64, 64],
						[256, 256],
						[8, 8]
					]
				];
				const area = 42.42;
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(null);
				vi.spyOn(coordinateServiceMock, 'toLonLat').mockImplementation((c) => c.map((v) => v * 2));
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'getArea').mockReturnValue(area);

				const result = instanceUnderTest.calcArea(coordinateInMapProjection);

				expect(result).toBe(area);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(
					[
						[
							[16, 16],
							[128, 128],
							[512, 512],
							[16, 16]
						]
					],
					true
				);
			});
		});

		describe('one or more coordinates are outside the projected extent', () => {
			it('calculates the area by calling the OlCoordinateService', () => {
				const instanceUnderTest = setup();
				const coordinateInMapProjection = [
					[
						[8, 8],
						[64, 64],
						[256, 256],
						[8, 8]
					]
				];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const area = 42.42;
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				const containsCoordinateSpy = vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockImplementation((_, c) => {
					if (equals(c, [64, 64])) {
						return false;
					}
					return true;
				});
				vi.spyOn(coordinateServiceMock, 'toLonLat').mockImplementation((c) => c.map((v) => v * 2));
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'getArea').mockReturnValue(area);

				const result = instanceUnderTest.calcArea(coordinateInMapProjection);

				expect(result).toBe(area);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(
					[
						[
							[16, 16],
							[128, 128],
							[512, 512],
							[16, 16]
						]
					],
					true
				);
				expect(containsCoordinateSpy).toHaveBeenCalledWith(localProjectedSridExtent, expect.anything());
			});
		});

		describe('all coordinates are inside the projected extent', () => {
			it('calculates the area by calling the OlCoordinateService', () => {
				const instanceUnderTest = setup();
				const srid = 3857;
				const localProjectedSrid = 25832;
				const coordinateInMapProjection = [
					[
						[8, 8],
						[64, 64],
						[256, 256],
						[8, 8]
					]
				];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const area = 42.42;
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				vi.spyOn(instanceUnderTest, 'getSrid').mockReturnValue(srid);
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSrid').mockReturnValue(localProjectedSrid);
				const containsCoordinateSpy = vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockImplementation(() => true);
				const transformSpy = vi.spyOn(coordinateServiceMock, 'transform').mockImplementation((c) => c.map((v) => v * 2));
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'getArea').mockReturnValue(area);

				const result = instanceUnderTest.calcArea(coordinateInMapProjection);

				expect(result).toBe(area);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(
					[
						[
							[16, 16],
							[128, 128],
							[512, 512],
							[16, 16]
						]
					],
					false
				);
				expect(containsCoordinateSpy).toHaveBeenCalledWith(localProjectedSridExtent, expect.anything());
				expect(transformSpy).toHaveBeenCalledWith(expect.any(Array), srid, localProjectedSrid);
			});
		});
	});
	describe('calcLength', () => {
		describe('no projected extent available', () => {
			it('calculates the length by calling the OlCoordinateService', () => {
				const instanceUnderTest = setup();
				const coordinateInMapProjection = [
					[1, 1],
					[100, 100]
				];
				const length = 42.42;
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(null);
				vi.spyOn(coordinateServiceMock, 'toLonLat').mockImplementation((c) => c.map((v) => v * 2));
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'getLength').mockReturnValue(length);

				const result = instanceUnderTest.calcLength(coordinateInMapProjection);

				expect(result).toBe(length);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(
					[
						[2, 2],
						[200, 200]
					],
					true
				);
			});
		});

		describe('one or more coordinates are outside the projected extent', () => {
			it('calculates the length by calling the OlCoordinateService', () => {
				const instanceUnderTest = setup();
				const coordinateInMapProjection = [
					[1, 1],
					[100, 100]
				];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const length = 42.42;
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				const containsCoordinateSpy = vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockImplementation((_, c) => {
					if (equals(c, [100, 100])) {
						return false;
					}
					return true;
				});
				vi.spyOn(coordinateServiceMock, 'toLonLat').mockImplementation((c) => c.map((v) => v * 2));
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'getLength').mockReturnValue(length);

				const result = instanceUnderTest.calcLength(coordinateInMapProjection);

				expect(result).toBe(length);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(
					[
						[2, 2],
						[200, 200]
					],
					true
				);
				expect(containsCoordinateSpy).toHaveBeenCalledWith(localProjectedSridExtent, expect.anything());
			});
		});

		describe('all coordinates are inside the projected extent', () => {
			it('calculates the length by calling the OlCoordinateService', () => {
				const instanceUnderTest = setup();
				const srid = 3857;
				const localProjectedSrid = 25832;
				const coordinateInMapProjection = [
					[1, 1],
					[100, 100]
				];
				const localProjectedSridExtent = [5, -80, 14, 80];
				const length = 42.42;
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').mockReturnValue(localProjectedSridExtent);
				vi.spyOn(instanceUnderTest, 'getSrid').mockReturnValue(srid);
				vi.spyOn(instanceUnderTest, 'getLocalProjectedSrid').mockReturnValue(localProjectedSrid);
				const containsCoordinateSpy = vi.spyOn(coordinateServiceMock, 'containsCoordinate').mockImplementation(() => true);
				const transformSpy = vi.spyOn(coordinateServiceMock, 'transform').mockImplementation((c) => c.map((v) => v * 2));
				const coordinateServiceSpy = vi.spyOn(coordinateServiceMock, 'getLength').mockReturnValue(length);

				const result = instanceUnderTest.calcLength(coordinateInMapProjection);

				expect(result).toBe(length);
				expect(coordinateServiceSpy).toHaveBeenCalledWith(
					[
						[2, 2],
						[200, 200]
					],
					false
				);
				expect(containsCoordinateSpy).toHaveBeenCalledWith(localProjectedSridExtent, expect.anything());
				expect(transformSpy).toHaveBeenCalledWith(expect.any(Array), srid, localProjectedSrid);
			});
		});
	});
});
