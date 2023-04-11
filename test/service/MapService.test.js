/* eslint-disable no-undef */
import { MapService } from '../../src/services/MapService';
import { $injector } from '../../src/injection';

describe('MapService', () => {
	const coordinateServiceMock = {
		fromLonLatExtent() {},
		toLonLatExtent() {},
		toLonLat() {},
		containsCoordinate() {}
	};

	beforeAll(() => {
		$injector.registerSingleton('CoordinateService', coordinateServiceMock);
	});

	const setup = () => {
		const definitionsProvider = () => {
			return {
				defaultExtent: [0, 1, 2, 3],
				localProjectedSridExtent: [4, 5, 6, 7],
				srid: 3857,
				defaultSridForView: 4326,
				localProjectedSridDefinitionsForView: () => [{ label: 'Local projected SRID', code: 9999 }],
				globalSridDefinitionsForView: [{ label: 'Global SRID', code: 1111 }],
				localProjectedSrid: 9999,
				minZoomLevel: 5,
				maxZoomLevel: 21
			};
		};
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
			spyOn(coordinateServiceMock, 'toLonLatExtent').withArgs([0, 1, 2, 3]).and.returnValue([4, 5, 6, 7]);

			expect(instanceUnderTest.getDefaultMapExtent(4326)).toEqual([4, 5, 6, 7]);
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
			spyOn(coordinateServiceMock, 'fromLonLatExtent').withArgs([4, 5, 6, 7]).and.returnValue([0, 1, 2, 3]);

			expect(instanceUnderTest.getLocalProjectedSridExtent()).toEqual([0, 1, 2, 3]);
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

	it('provides a default srid for the view', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getDefaultSridForView()).toBe(4326);
	});

	describe('Returns a list with all SridDefinition suitable for the UI', () => {
		it('provides an array of global SridDefintions when called without argument', () => {
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').and.returnValue([5, -80, 14, 80]);

			expect(instanceUnderTest.getSridDefinitionsForView()).toEqual([{ label: 'Global SRID', code: 1111 }]);
		});

		it('provides an array of global SridDefintions when local projected extent is not defined', () => {
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').and.returnValue(null);

			expect(instanceUnderTest.getSridDefinitionsForView([0, 0])).toEqual([{ label: 'Global SRID', code: 1111 }]);
		});

		it('provides an array of local projected SridDefintions when coordinate is within local projected extent', () => {
			const coordinate = [0, 0];
			const localProjectedSridExtent = [5, -80, 14, 80];
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').and.returnValue(localProjectedSridExtent);
			spyOn(coordinateServiceMock, 'containsCoordinate').withArgs(localProjectedSridExtent, coordinate).and.returnValue(true);

			expect(instanceUnderTest.getSridDefinitionsForView(coordinate)).toEqual([{ label: 'Local projected SRID', code: 9999 }]);
		});

		it('provides an array of global SridDefintions when when coordinate is outside local projected extent', () => {
			const coordinate = [0, 0];
			const localProjectedSridExtent = [5, -80, 14, 80];
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, 'getLocalProjectedSridExtent').and.returnValue(localProjectedSridExtent);
			spyOn(coordinateServiceMock, 'containsCoordinate').withArgs(localProjectedSridExtent, coordinate).and.returnValue(false);

			expect(instanceUnderTest.getSridDefinitionsForView(coordinate)).toEqual([{ label: 'Global SRID', code: 1111 }]);
		});
	});

	it('provides the internal srid of the map', () => {
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
			spyOn(instanceUnderTest, 'getSrid').and.returnValue(srid);
			spyOn(coordinateServiceMock, 'toLonLat').withArgs([0, 1]).and.returnValue(mock4326Coordinate);

			expect(instanceUnderTest.calcResolution(zoomLevel, mock3857Coordinate)).toBeCloseTo(expectedResolution, 3);
		});

		it('calculates the resolution', () => {
			const expectedResolution = 3273.3667254226675;
			const mock3857Coordinate = [0, 1];
			const mock4326Coordinate = [11, 48];
			const zoomLevel = 5;
			const srid = 3857;
			const tileSize = 256;
			const instanceUnderTest = setup();
			spyOn(coordinateServiceMock, 'toLonLat').withArgs([0, 1]).and.returnValue(mock4326Coordinate);

			expect(instanceUnderTest.calcResolution(zoomLevel, mock3857Coordinate, srid, tileSize)).toBeCloseTo(expectedResolution, 3);
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
				spyOn(instanceUnderTest, 'getSrid').and.returnValue(srid);

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
			spyOn(document, 'querySelector').withArgs('ba-footer').and.returnValue(mockFooter);
			spyOn(mockFooter.shadowRoot, 'querySelector').withArgs('.scale').and.returnValue(mockHTMElement);
			const instanceUnderTest = setup();

			const element = instanceUnderTest.getScaleLineContainer();

			expect(document.querySelector).toHaveBeenCalled();
			expect(mockFooter.shadowRoot.querySelector).toHaveBeenCalled();
			expect(element).toEqual(mockHTMElement);
		});

		it('returns null when element is not available', () => {
			spyOn(document, 'querySelector').withArgs('ba-footer');
			const instanceUnderTest = setup();

			const element = instanceUnderTest.getScaleLineContainer();

			expect(document.querySelector).toHaveBeenCalled();
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
			const spy1 = spyOn(overlappingElement1, 'getBoundingClientRect').and.returnValue(DOMRect.fromRect());
			const spy2 = spyOn(overlappingElement2, 'getBoundingClientRect').and.returnValue(DOMRect.fromRect());
			const spy3 = spyOn(nonOverlappingElement, 'getBoundingClientRect').and.returnValue(DOMRect.fromRect());
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
				spyOn(leftSideElement, 'getBoundingClientRect').and.returnValue(DOMRect.fromRect({ x: 50, y: 50, width: 50, height: 550 }));
				spyOn(bottomElement, 'getBoundingClientRect').and.returnValue(DOMRect.fromRect({ x: 100, y: 500, width: 450, height: 50 }));
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
				spyOn(rightSideElement, 'getBoundingClientRect').and.returnValue(DOMRect.fromRect({ x: 500, y: 50, width: 50, height: 550 }));
				spyOn(topElement, 'getBoundingClientRect').and.returnValue(DOMRect.fromRect({ x: 50, y: 50, width: 450, height: 50 }));
				const instanceUnderTest = setup();

				const visibleViewPort = instanceUnderTest.getVisibleViewport(mapElementMock);

				expect(visibleViewPort).toEqual({ top: 50, right: 50, bottom: 0, left: 0 });
			});
		});
	});
});
