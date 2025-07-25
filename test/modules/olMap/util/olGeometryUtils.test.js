import {
	canShowAzimuthCircle,
	getCoordinateAt,
	getAzimuth,
	isVertexOfGeometry,
	getPartitionDelta,
	isValidGeometry,
	moveParallel,
	calculatePartitionResidualOfSegments,
	getStats,
	getPolygonFrom,
	getAzimuthFrom,
	getBoundingBoxFrom,
	simplify,
	PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857,
	PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES,
	getLineString,
	multiLineStringToLineString,
	getCoordinatesForElevationProfile,
	polarStakeOut,
	isClockwise
} from '../../../../src/modules/olMap/utils/olGeometryUtils';
import { Point, MultiPoint, LineString, Polygon, Circle, LinearRing, MultiLineString, MultiPolygon, GeometryCollection } from 'ol/geom';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { $injector } from '../../../../src/injection';
import { GeometryType } from '../../../../src/domain/geometryTypes';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

const mapServiceMock = {
	getSrid: () => 3857,
	calcLength: () => {},
	calcArea: () => {}
};

$injector.registerSingleton('MapService', mapServiceMock);

describe('canShowAzimuthCircle', () => {
	it('can show for a 2-point-line', () => {
		const twoPointLineString = new LineString([
			[0, 0],
			[1, 0]
		]);

		expect(canShowAzimuthCircle(twoPointLineString)).toBeTrue();
	});

	it('can show for a pseudo-2-point-line', () => {
		const threePointLineString = new LineString([
			[0, 0],
			[1, 0],
			[1, 0]
		]);

		expect(canShowAzimuthCircle(threePointLineString)).toBeTrue();
	});

	it('can show for a MultiLineString with azimuth property', () => {
		const validMultiLineString = new MultiLineString([
			[
				[0, 0],
				[1, 0],
				[1, 0]
			]
		]);
		const invalidMultiLineString = new MultiLineString([
			[
				[0, 0],
				[1, 0],
				[1, 0]
			]
		]);
		validMultiLineString.set('azimuth', 42);

		expect(canShowAzimuthCircle(validMultiLineString)).toBeTrue();
		expect(canShowAzimuthCircle(invalidMultiLineString)).toBeFalse();
	});

	it('can NOT show for a point', () => {
		const point = new Point([0, 0]);

		expect(canShowAzimuthCircle(point)).toBeFalse();
	});

	it('can NOT show for lineString', () => {
		const threePointLineString = new LineString([
			[0, 0],
			[1, 0],
			[2, 1]
		]);

		expect(canShowAzimuthCircle(threePointLineString)).toBeFalse();
	});
});

describe('getAzimuth', () => {
	describe('when different geometryTypes', () => {
		it('calculates angle for a LineString', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[1, 0]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(90);
		});

		it('reads angle as property for a MultiLineString', () => {
			const twoPointLineString = new MultiLineString([
				[
					[0, 0],
					[1, 0]
				]
			]);
			twoPointLineString.set('azimuth', 42);

			expect(getAzimuth(twoPointLineString)).toBe(42);
		});

		it('does not calculate angle due to missing azimuth property from a MultiLineString', () => {
			const twoPointLineString = new MultiLineString([
				[
					[0, 0],
					[1, 0]
				]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(null);
		});

		it('calculates angle for a LinearRing', () => {
			const linearRing = new LinearRing([
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]);

			expect(getAzimuth(linearRing)).toBe(90);
		});

		it('calculates angle for a Polygon', () => {
			const polygonCounterClockwise = new Polygon([
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0]
				]
			]);
			const polygonClockwise = new Polygon([
				[
					[0, 0],
					[0, 1],
					[1, 1],
					[1, 0],
					[0, 0]
				]
			]);
			expect(getAzimuth(polygonCounterClockwise)).toBe(0);
			expect(getAzimuth(polygonClockwise)).toBe(0);
		});

		it('calculates NO angle for a incomplete LineString', () => {
			const onePointLineString = new LineString([[0, 0]]);

			expect(getAzimuth(onePointLineString)).toBeNull();
		});

		it('calculates NO angle for a Point', () => {
			const point = new Point([0, 0]);

			expect(getAzimuth(point)).toBeNull();
		});
	});

	describe('when direction goes in different directions', () => {
		it('calculates angle for North', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[0, 1]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(0);
		});

		it('calculates angle for North-East', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[1, 1]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(45);
		});

		it('calculates angle for East', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[1, 0]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(90);
		});

		it('calculates angle for South-East', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[1, -1]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(135);
		});

		it('calculates angle for South', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[0, -1]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(180);
		});

		it('calculates angle for South-West', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[-1, -1]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(225);
		});

		it('calculates angle for West', () => {
			const twoPointLineString = new LineString([
				[0, 0],
				[-1, 0]
			]);

			expect(getAzimuth(twoPointLineString)).toBe(270);
		});
	});
});

describe('getAzimuthFrom', () => {
	it('calculates the intermediate azimuth for a convex quadrilateral polygon', () => {
		const nonUniformQuadrangle = new Polygon([
			[
				[0, 10],
				[10, 9],
				[10, 0],
				[0, -2],
				[0, 10]
			]
		]);
		const squaredQuadrangle = new Polygon([
			[
				[0, 10],
				[10, 9],
				[10, 0],
				[0, -1],
				[0, 10]
			]
		]);
		const lineString = new LineString([
			[0, 10],
			[10, 9],
			[10, 0]
		]);
		const point = new Point([0, 10]);

		expect(getAzimuthFrom(nonUniformQuadrangle)).toBeCloseTo(0.048863, 4);
		expect(getAzimuthFrom(squaredQuadrangle)).toBeCloseTo(0.0, 5);

		expect(getAzimuthFrom(lineString)).toBeNull();
		expect(getAzimuthFrom(point)).toBeNull();

		expect(getAzimuthFrom(null)).toBeNull();
		expect(getAzimuthFrom(undefined)).toBeNull();
	});
});

describe('getCoordinateAt', () => {
	it('calculates coordinate for LineString', () => {
		const lineString = new LineString([
			[0, 0],
			[2, 0]
		]);
		const coord = getCoordinateAt(lineString, 0.5);

		expect(coord[0]).toBe(1);
		expect(coord[1]).toBe(0);
	});

	it('calculates coordinate for LinearRing', () => {
		const linearRing = new LinearRing([
			[0, 0],
			[2, 0]
		]);
		const coord = getCoordinateAt(linearRing, 0.5);

		expect(coord[0]).toBe(1);
		expect(coord[1]).toBe(0);
	});

	it('calculates coordinate for Polygon', () => {
		const polygon = new Polygon([
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]
		]);
		const coord = getCoordinateAt(polygon, 0.5);

		expect(coord[0]).toBe(1);
		expect(coord[1]).toBe(1);
	});

	it('calculates NO coordinate for Circle', () => {
		const circle = new Circle([0, 0], 1);
		const coord = getCoordinateAt(circle, 0.5);

		expect(coord).toBeNull();
	});
});

describe('isVertexOfGeometry', () => {
	it('resolves a Point as Vertex of a Point', () => {
		const geometry = new Point([0, 0]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a Point', () => {
		const geometry = new Point([0, 0]);
		const vertexCandidate = new Point([0, 1]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves a Point as Vertex of a MultiPoint', () => {
		const geometry = new MultiPoint([
			[0, 0],
			[0, 1]
		]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a MultiPoint', () => {
		const geometry = new MultiPoint([
			[0, 0],
			[0, 1]
		]);
		const vertexCandidate = new Point([0, 2]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves a Point as Vertex of a LineString', () => {
		const geometry = new LineString([
			[0, 0],
			[2, 0]
		]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a LineString', () => {
		const geometry = new LineString([
			[0, 0],
			[2, 0]
		]);
		const vertexCandidate = new Point([1, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves a Point as Vertex of a LinearRing', () => {
		const geometry = new LinearRing([
			[0, 0],
			[2, 0]
		]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a LinearRing', () => {
		const geometry = new LinearRing([
			[0, 0],
			[2, 0]
		]);
		const vertexCandidate = new Point([1, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves a Point as Vertex of a Polygon', () => {
		const geometry = new Polygon([
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]
		]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a Polygon', () => {
		const geometry = new Polygon([
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]
		]);
		const vertexCandidate = new Point([0.5, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves to false when vertexCandidate is NOT Point', () => {
		const geometry = new Polygon([
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]
		]);
		const vertexCandidate = new LineString([
			[0, 0],
			[1, 0]
		]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});
});

describe('getPartitionDelta', () => {
	it('calculates a sub delta', () => {
		const geometryLength = 15;

		const delta = getPartitionDelta(geometryLength);

		expect(delta).toBe(1);
	});

	it('calculates a delta with standard resolution', () => {
		const geometryLength = 200;

		const delta = getPartitionDelta(geometryLength);

		expect(delta).toBe(0.5);
	});

	it('calculates a delta with defined resolution', () => {
		const geometryLength = 5000;
		const resolution = 50;

		const delta = getPartitionDelta(geometryLength, resolution);

		expect(delta).toBe(1);
	});

	it('calculates a delta for longest lines', () => {
		const geometryLength = 50000000;
		const resolution = 50;

		const delta = getPartitionDelta(geometryLength, resolution);

		expect(delta).toBe(0.2);
	});
});

describe('isValidGeometry', () => {
	it('validates Geometries', () => {
		expect(isValidGeometry(new Point([0, 0]))).toBeTrue();
		expect(
			isValidGeometry(
				new MultiPoint([
					[0, 0],
					[15, 0]
				])
			)
		).toBeTrue();
		expect(isValidGeometry(new MultiPoint([[0, 0]]))).toBeTrue();
		expect(
			isValidGeometry(
				new LineString([
					[0, 0],
					[15, 0]
				])
			)
		).toBeTrue();
		expect(
			isValidGeometry(
				new MultiLineString([
					[
						[0, 0],
						[15, 0]
					],
					[
						[16, 0],
						[20, 0]
					]
				])
			)
		).toBeTrue();

		expect(
			isValidGeometry(
				new Polygon([
					[
						[0, 0],
						[15, 0],
						[15, 15]
					]
				])
			)
		).toBeTrue();

		expect(
			isValidGeometry(
				new MultiPolygon([
					[
						[
							[0, 0],
							[15, 0],
							[15, 15]
						]
					],
					[
						[
							[10, 10],
							[15, 10],
							[15, 30]
						]
					],
					[
						[
							[0, 20],
							[15, 20],
							[15, 45]
						]
					]
				])
			)
		).toBeTrue();

		expect(
			isValidGeometry(
				new GeometryCollection([
					new LineString([
						[0, 0],
						[15, 0]
					]),
					new Polygon([
						[
							[0, 0],
							[15, 0],
							[15, 15]
						]
					]),
					new MultiPolygon([
						[
							[
								[0, 0],
								[15, 0],
								[15, 15]
							]
						],
						[
							[
								[0, 20],
								[15, 20],
								[15, 45]
							]
						]
					])
				])
			)
		).toBeTrue();

		expect(isValidGeometry(new LineString([[0, 0]]))).toBeFalse();
		expect(
			isValidGeometry(
				new MultiLineString([
					[
						[0, 0],
						[15, 0]
					],
					[
						// invalid part
						[16, 0]
					],
					[
						[17, 3],
						[20, 3]
					]
				])
			)
		).toBeFalse();
		expect(
			isValidGeometry(
				new Polygon([
					[
						[0, 0],
						[15, 0]
					]
				])
			)
		).toBeFalse();
		expect(
			isValidGeometry(
				new MultiPolygon([
					[
						[
							[0, 0],
							[15, 0],
							[15, 15]
						]
					],
					[
						// invalid polygon
						[
							[10, 10],
							[15, 10]
						]
					],
					[
						[
							[0, 20],
							[15, 20],
							[15, 45]
						]
					]
				])
			)
		).toBeFalse();
		expect(
			isValidGeometry(
				new GeometryCollection([
					new LineString([
						[0, 0],
						[15, 0]
					]),
					//invalid part
					new Polygon([
						[
							[0, 0],
							[15, 0]
						]
					]),
					new MultiPolygon([
						[
							[
								[0, 0],
								[15, 0],
								[15, 15]
							]
						],
						[
							[
								[0, 20],
								[15, 20],
								[15, 45]
							]
						]
					])
				])
			)
		).toBeFalse();

		expect(isValidGeometry(null)).toBeFalse();
		expect(isValidGeometry(new Circle([0, 0], 10))).toBeFalse();
	});
});

describe('moveParallel', () => {
	it('move lines parallel', () => {
		expect(moveParallel([0, 0], [1, 0], 1).getCoordinates()).toEqual([
			[0, -1],
			[1, -1]
		]);
		expect(moveParallel([0, 0], [1, 0], 3).getCoordinates()).toEqual([
			[0, -3],
			[1, -3]
		]);
	});
});

describe('polarStakeOut', () => {
	it('creates a point', () => {
		expect(polarStakeOut([0, 0], 0, 1)).toEqual([1, 0]);
		const result = polarStakeOut([0, 0], 45, 1.5);
		expect(result[0]).toBeCloseTo(1, 0);
		expect(result[1]).toBeCloseTo(1, 0);
	});
});

describe('calculatePartitionResidualOfSegments', () => {
	it('calculates no residuals for a Point', () => {
		expect(calculatePartitionResidualOfSegments(new Point([0, 0]))).toEqual([]);
	});

	it('calculates residuals for a LineString', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(30);
		expect(
			calculatePartitionResidualOfSegments(
				new LineString([
					[0, 0],
					[15, 0]
				]),
				10
			)
		).toEqual([0]);
		expect(
			calculatePartitionResidualOfSegments(
				new LineString([
					[0, 0],
					[15, 0]
				]),
				16
			)
		).toEqual([0]);
	});

	it('calculates residuals for a LinearRing', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(30);
		expect(
			calculatePartitionResidualOfSegments(
				new LinearRing([
					[0, 0],
					[15, 0],
					[15, 15]
				]),
				5
			)
		).toEqual([0, 0.1]);
		expect(
			calculatePartitionResidualOfSegments(
				new LinearRing([
					[0, 0],
					[15, 0],
					[15, 15]
				]),
				10
			)
		).toEqual([0, 0.05]);
	});

	it('calculates residuals for a Polygon', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(30);
		expect(
			calculatePartitionResidualOfSegments(
				new Polygon([
					[
						[0, 0],
						[15, 0],
						[15, 15]
					]
				]),
				5
			)
		).toEqual([0, 0.1]);
		expect(
			calculatePartitionResidualOfSegments(
				new Polygon([
					[
						[0, 0],
						[15, 0],
						[15, 15]
					]
				]),
				10
			)
		).toEqual([0, 0.05]);
	});
});

describe('getStats', () => {
	it('returns a empty statistic-object', () => {
		const statsForNoGeometry = getStats(null);

		expect(statsForNoGeometry.geometryType).toBeNull();
		expect(statsForNoGeometry.coordinate).toBeNull();
		expect(statsForNoGeometry.azimuth).toBeNull();
		expect(statsForNoGeometry.length).toBeNull();
		expect(statsForNoGeometry.area).toBeNull();
	});

	it('returns a statistic-object for Point', () => {
		const statsForPoint = getStats(new Point([42, 42]));

		expect(statsForPoint.geometryType).toBe(GeometryType.POINT);
		expect(statsForPoint.coordinate).toEqual([42, 42]);
		expect(statsForPoint.azimuth).toBeNull();
		expect(statsForPoint.length).toBeNull();
		expect(statsForPoint.area).toBeNull();
	});

	it('returns a statistic-object for two-point LineString', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(42);
		const statsForLineString = getStats(
			new LineString([
				[0, 0],
				[42, 42]
			])
		);

		expect(statsForLineString.geometryType).toBe(GeometryType.LINE);
		expect(statsForLineString.coordinate).toBeNull();
		expect(statsForLineString.azimuth).toBe(45);
		expect(statsForLineString.length).toBe(42);
		expect(statsForLineString.area).toBeNull();
	});

	it('returns a statistic-object for n-point (2<n) LineString', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(42);
		const statsForLineString = getStats(
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			])
		);

		expect(statsForLineString.geometryType).toBe(GeometryType.LINE);
		expect(statsForLineString.coordinate).toBeNull();
		expect(statsForLineString.azimuth).toBeNull();
		expect(statsForLineString.length).toBe(42);
		expect(statsForLineString.area).toBeNull();
	});

	it('returns a statistic-object for MultiLineString', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(42);
		const statsForMultiLineString = getStats(
			new MultiLineString([
				new LineString([
					[0, 0],
					[42, 42],
					[3, 5]
				]),
				new LineString([
					[3, 5],
					[21, 21],
					[1, 1]
				])
			])
		);

		expect(statsForMultiLineString.geometryType).toBe(GeometryType.LINE);
		expect(statsForMultiLineString.coordinate).toBeNull();
		expect(statsForMultiLineString.azimuth).toBeNull();
		expect(statsForMultiLineString.length).toBe(84);
		expect(statsForMultiLineString.area).toBeNull();
	});

	it('returns a statistic-object for Polygon', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(42);
		spyOn(mapServiceMock, 'calcArea').and.returnValue(21);
		const statsForPolygon = getStats(
			new Polygon([
				[
					[0, 0],
					[15, 0],
					[15, 15]
				]
			])
		);

		expect(statsForPolygon.geometryType).toBe(GeometryType.POLYGON);
		expect(statsForPolygon.coordinate).toBeNull();
		expect(statsForPolygon.azimuth).toBeNull();
		expect(statsForPolygon.length).toBeTruthy();
		expect(statsForPolygon.area).toBeTruthy();
	});
});

describe('getPolygonFrom', () => {
	it('creates a polygon from an extent', () => {
		expect(getPolygonFrom([0, 0, 1, 1]).getCoordinates()).toEqual([
			[
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0],
				[0, 1]
			]
		]);
	});

	it('does NOT create anything from invalid input', () => {
		expect(getPolygonFrom(undefined)).toBeNull();
		expect(getPolygonFrom(null)).toBeNull();

		expect(getPolygonFrom([])).toBeNull();
		expect(getPolygonFrom([0])).toBeNull();
		expect(getPolygonFrom([0, 1])).toBeNull();
		expect(getPolygonFrom([0, 1, 2])).toBeNull();
		expect(getPolygonFrom([0, 1, 2, 3, 4])).toBeNull();

		expect(getPolygonFrom('foo ')).toBeNull();

		expect(getPolygonFrom({})).toBeNull();
	});
});

describe('getBoundingBoxFrom', () => {
	it('creates a boundingbox', () => {
		expect(getBoundingBoxFrom([10, 0], { width: 4, height: 4 })).toEqual([8, -2, 12, 2]);
		expect(getBoundingBoxFrom([42, 42], { width: 5, height: 5 })).toEqual([39.5, 39.5, 44.5, 44.5]);

		expect(getBoundingBoxFrom(null, { width: 4, height: 4 })).toBeUndefined();
		expect(getBoundingBoxFrom([10, 10], null)).toBeUndefined();

		expect(getBoundingBoxFrom(undefined, { width: 4, height: 4 })).toBeUndefined();
		expect(getBoundingBoxFrom([10, 10], undefined)).toBeUndefined();

		expect(getBoundingBoxFrom([10, 10], { width: 'foo', height: 4 })).toBeUndefined();
		expect(getBoundingBoxFrom([10, 10], { width: 4, height: 'bar' })).toBeUndefined();
		expect(getBoundingBoxFrom([10, 10], { width: null, height: 4 })).toBeUndefined();
		expect(getBoundingBoxFrom([10, 10], { width: 4, height: 'bar' })).toBeUndefined();
	});

	describe('simplify', () => {
		it('creates a simplified version of a geometry', () => {
			const simplifiedGeom = simplify(
				new LineString([
					[0, 0],
					[420, 420],
					[421, 421],
					[3, 5]
				]),
				3,
				1
			);

			expect(simplifiedGeom.getCoordinates()).toEqual([
				[0, 0],
				[421, 421],
				[3, 5]
			]);
		});

		it('does nothing when coordinates length <= maxCount ', () => {
			const coordinates = [
				[0, 0],
				[420, 420],
				[421, 421],
				[3, 5]
			];

			const simplifiedGeom = simplify(new LineString(coordinates), coordinates.length, 1);

			expect(simplifiedGeom.getCoordinates()).toEqual(coordinates);
		});

		it('does nothing when argument are not present', () => {
			const geom = new LineString([
				[0, 0],
				[420, 420],
				[421, 421],
				[3, 5]
			]);

			expect(simplify(geom)).toEqual(geom);
			expect(simplify(geom, 5)).toEqual(geom);
			expect(simplify(null, 5, 5)).toBeNull();
		});

		it('does nothing when a geometry is not an ol geometry', () => {
			const geom = {};

			expect(simplify(geom, 3, 1)).toEqual(geom);
		});
	});

	describe('constants', () => {
		it('defines constant values', () => {
			expect(PROFILE_GEOMETRY_SIMPLIFY_DISTANCE_TOLERANCE_3857).toBe(17.5);
			expect(PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES).toBe(1000);
		});
	});

	describe('getLineString', () => {
		const point = new Point([0, 0]);
		const lineString = new LineString([
			[0, 0],
			[15, 0]
		]);

		const linearRing = new LinearRing([
			[0, 0],
			[15, 0],
			[15, 15]
		]);
		const polygon = new Polygon([
			[
				[16, 16],
				[16, 0],
				[0, 0]
			]
		]);

		const pseudoMultLineString = new MultiLineString([
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			])
		]);

		const multiLineString = new MultiLineString([
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			]),
			new LineString([
				[3, 5],
				[21, 21],
				[1, 1]
			])
		]);
		const disconnectedMultiLineString = new MultiLineString([
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			]),
			new LineString([
				[3, 5],
				[21, 21],
				[1, 1]
			]),
			new LineString([
				[4, 1],
				[12, 12],
				[7, 1]
			])
		]);

		it('creates a LineString', () => {
			expect(getLineString(lineString)).toBe(lineString);

			const fromLinearRing = getLineString(linearRing);
			expect(fromLinearRing).toBeInstanceOf(LineString);
			expect(fromLinearRing.getCoordinates()).toEqual([
				[0, 0],
				[15, 0],
				[15, 15]
			]);

			const fromPolygon = getLineString(polygon);
			expect(fromPolygon).toBeInstanceOf(LineString);
			expect(fromPolygon.getCoordinates()).toEqual([
				[16, 16],
				[16, 0],
				[0, 0]
			]);

			const fromPseudoMultiLineString = getLineString(pseudoMultLineString);
			expect(fromPseudoMultiLineString).toBeInstanceOf(LineString);
			expect(fromPseudoMultiLineString.getCoordinates()).toEqual([
				[0, 0],
				[42, 42],
				[3, 5]
			]);

			const fromMultiLineString = getLineString(multiLineString);
			expect(fromMultiLineString).toBeInstanceOf(LineString);
			expect(fromMultiLineString.getCoordinates()).toEqual([
				[0, 0],
				[42, 42],
				[3, 5],
				[3, 5],
				[21, 21],
				[1, 1]
			]);
		});

		it('does NOT create a LineString', () => {
			expect(getLineString(point)).toBeNull();
			expect(getLineString(disconnectedMultiLineString)).toBeNull();
		});
	});

	describe('multiLineStringToLineString', () => {
		const point = new Point([0, 0]);
		const lineString = new LineString([
			[0, 0],
			[15, 0]
		]);

		const linearRing = new LinearRing([
			[0, 0],
			[15, 0],
			[15, 15]
		]);
		const polygon = new Polygon([
			[
				[16, 16],
				[16, 0],
				[0, 0]
			]
		]);
		const pseudoMultiLineString = new MultiLineString([
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			])
		]);

		const connectedMultiLineString = new MultiLineString([
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			]),
			new LineString([
				[3, 5],
				[21, 21],
				[1, 1]
			]),
			new LineString([
				[1, 1],
				[12, 12],
				[7, 1]
			])
		]);

		const disconnectedMultiLineString = new MultiLineString([
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			]),
			new LineString([
				[3, 5],
				[21, 21],
				[1, 1]
			]),
			new LineString([
				[4, 1],
				[12, 12],
				[7, 1]
			])
		]);

		it('does NOT create a LineString', () => {
			expect(multiLineStringToLineString(point)).toBeNull();
			expect(multiLineStringToLineString(lineString)).toBeNull();
			expect(multiLineStringToLineString(linearRing)).toBeNull();
			expect(multiLineStringToLineString(polygon)).toBeNull();
			expect(multiLineStringToLineString(disconnectedMultiLineString)).toBeNull();
		});

		it('creates a LineString', () => {
			const fromPseudoMultiLineString = getLineString(pseudoMultiLineString);
			expect(fromPseudoMultiLineString).toBeInstanceOf(LineString);
			expect(fromPseudoMultiLineString.getCoordinates()).toEqual([
				[0, 0],
				[42, 42],
				[3, 5]
			]);

			const fromConnectedMultiLineString = getLineString(connectedMultiLineString);
			expect(fromConnectedMultiLineString).toBeInstanceOf(LineString);
			expect(fromConnectedMultiLineString.getCoordinates()).toEqual([
				[0, 0],
				[42, 42],
				[3, 5],
				[3, 5],
				[21, 21],
				[1, 1],
				[1, 1],
				[12, 12],
				[7, 1]
			]);
		});
	});

	describe('getCoordinatesForElevationProfile', () => {
		it('creates a simplified version of a geometry', () => {
			const coordinatesMaxCountExceeded = [];

			for (let index = 0; index <= PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES; index++) {
				coordinatesMaxCountExceeded.push([0, index]);
			}

			expect(getCoordinatesForElevationProfile(new LineString(coordinatesMaxCountExceeded))).toEqual([
				[0, 0],
				[0, 1000]
			]);
		});

		it('returns an empty array when geometry cannot be converted to a LineString', () => {
			const multiPolygon = new MultiPolygon([
				new Polygon([
					[
						[3, 3],
						[4, 4],
						[4, 3],
						[3, 3]
					]
				]),
				new Polygon([
					[
						[5, 5],
						[6, 6],
						[5, 6],
						[5, 5]
					]
				])
			]);

			expect(getCoordinatesForElevationProfile(multiPolygon)).toEqual([]);
		});

		it('returns an empty array when a geometry is not a ol geometry', () => {
			const geometry = {};

			expect(getCoordinatesForElevationProfile(geometry)).toEqual([]);
		});
	});
});

describe('isClockwise', () => {
	it('determines the clockwise orientation of a simple polygon', () => {
		const clockwiseCoordinates = [
			[1, 0],
			[1, 5],
			[4, 5],
			[6, 4],
			[5, 0]
		];

		const counterClockwiseCoordinates = [
			[5, 0],
			[6, 4],
			[4, 5],
			[1, 5],
			[1, 0]
		];

		expect(isClockwise(clockwiseCoordinates)).toBeTrue();
		expect(isClockwise(clockwiseCoordinates.toReversed())).toBeFalse();

		expect(isClockwise(counterClockwiseCoordinates)).toBeFalse();
		expect(isClockwise(counterClockwiseCoordinates.toReversed())).toBeTrue();
	});

	it('does NOT determine an orientation for co-linear coordinates', () => {
		const colinearCoordinates = [
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4]
		];

		expect(isClockwise(colinearCoordinates)).toBeUndefined();
	});

	it('does NOT determine an orientation for invalid (lineString?) coordinates', () => {
		const lineStringCoordinates = [
			[0, 0],
			[42, 21]
		];

		expect(isClockwise(lineStringCoordinates)).toBeUndefined();
		expect(isClockwise([])).toBeUndefined();
		expect(isClockwise([[]])).toBeUndefined();
		expect(isClockwise([[0, 0]])).toBeUndefined();
	});
});
