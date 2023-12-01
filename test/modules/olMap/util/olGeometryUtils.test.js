import {
	getGeometryLength,
	getArea,
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
	getCoordinatesForElevationProfile
} from '../../../../src/modules/olMap/utils/olGeometryUtils';
import { Point, MultiPoint, LineString, Polygon, Circle, LinearRing, MultiLineString, MultiPolygon } from 'ol/geom';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { fromLonLat } from 'ol/proj';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('getGeometryLength', () => {
	it('calculates the length of a LineString', () => {
		const lineString = new LineString([
			[0, 0],
			[1, 0]
		]);
		const length = getGeometryLength(lineString);

		expect(length).toBe(1);
	});

	it('calculates the length of a LinearRing', () => {
		const linearRing = new LinearRing([
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
			[0, 0]
		]);
		const length = getGeometryLength(linearRing);

		expect(length).toBe(4);
	});

	it('calculates the length of a Polygon', () => {
		const polygon = new Polygon([
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]
		]);
		const length = getGeometryLength(polygon);

		expect(length).toBe(4);
	});

	it('does NOT calculates the length of Circle', () => {
		const circle = new Circle([0, 0], 1);
		const length = getGeometryLength(circle);

		expect(length).toBe(0);
	});

	it('does NOT calculates the length of null', () => {
		const length = getGeometryLength(null);

		expect(length).toBe(0);
	});

	describe('when calculationHints are provided', () => {
		it('calculates the length of a transformed geometry', () => {
			const geometry = new Polygon([
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0]
				]
			]);
			const cloneMock = { transform: () => {} };
			spyOn(geometry, 'clone').and.callFake(() => cloneMock);
			const calculationHints = { fromProjection: 'foo', toProjection: 'bar' };

			const transformSpy = spyOn(cloneMock, 'transform').and.callFake(() => geometry);
			getGeometryLength(geometry, calculationHints);

			expect(transformSpy).toHaveBeenCalledWith('foo', 'EPSG:4326');
			expect(transformSpy).toHaveBeenCalledWith('foo', 'bar');
		});
	});

	describe('when calculationHints with extent are provided', () => {
		it('calculates the geodesic length of a transformed geometry', () => {
			const utm32Distance = 149200.428;
			const geodesicDistance = 149246.522;
			const lineString = new LineString([fromLonLat([9, 48]), fromLonLat([11, 48])]);
			const calculationHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' };

			// within
			expect(getGeometryLength(lineString, { ...calculationHints, toProjectionExtent: [9, -60, 11, 60] })).toBeCloseTo(utm32Distance);
			// partially within
			expect(getGeometryLength(lineString, { ...calculationHints, toProjectionExtent: [10, -60, 12, 60] })).toBeCloseTo(geodesicDistance);
			// outside
			expect(getGeometryLength(lineString, { ...calculationHints, toProjectionExtent: [12, -60, 13, 60] })).toBeCloseTo(geodesicDistance);
		});
	});
});

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

		it('calculates NO angle for a imcomplete LineString', () => {
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

describe('getArea', () => {
	it('calculates the area for a Polygon', () => {
		const polygon = new Polygon([
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]
		]);
		const area = getArea(polygon);

		expect(area).toBe(1);
	});

	it('calculates the area for a projected Polygon', () => {
		const polygon = new Polygon([
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]
		]);
		const calculationHints = { fromProjection: 'EPSG:4326', toProjection: 'EPSG:25832' };
		const area = getArea(polygon, calculationHints);

		expect(area).toBeCloseTo(12575513411.866, 2);
	});

	it('returns 0 for a non-area-like geometry', () => {
		const point = new Point([0, 0]);
		const lineString = new LineString([
			[0, 0],
			[2, 0]
		]);
		const linearRing = new LinearRing([
			[0, 0],
			[2, 0]
		]);

		const pointArea = getArea(point);
		const lineStringArea = getArea(lineString);
		const linearRingArea = getArea(linearRing);

		expect(pointArea).toBe(0);
		expect(lineStringArea).toBe(0);
		expect(linearRingArea).toBe(0);
	});

	describe('when calculationHints with extent are provided', () => {
		it('calculates the geodesic area of a transformed polygon', () => {
			const utm32Area = 8327453871.901;
			const geodesicArea = 8333081687.76;
			const lineString = new Polygon([[fromLonLat([9, 48]), fromLonLat([11, 48]), fromLonLat([10, 47])]]);
			const calculationHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' };

			// within
			expect(getArea(lineString, { ...calculationHints, toProjectionExtent: [9, -60, 11, 60] })).toBeCloseTo(utm32Area);
			// partially within
			expect(getArea(lineString, { ...calculationHints, toProjectionExtent: [10, -60, 12, 60] })).toBeCloseTo(geodesicArea);
			// outside
			expect(getArea(lineString, { ...calculationHints, toProjectionExtent: [12, -60, 13, 60] })).toBeCloseTo(geodesicArea);
		});

		it('calculates the geodesic area of a transformed polygon with hole', () => {
			const utm32Area = 8322890782.498;
			const geodesicArea = 8328516236.574;
			const lineString = new Polygon([
				[fromLonLat([9, 48]), fromLonLat([11, 48]), fromLonLat([10, 47])],
				[fromLonLat([9.5, 47.5]), fromLonLat([10.5, 47.5]), fromLonLat([10, 47.5])]
			]);
			const calculationHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' };

			// within
			expect(getArea(lineString, { ...calculationHints, toProjectionExtent: [9, -60, 11, 60] })).toBeCloseTo(utm32Area);
			// partially within
			expect(getArea(lineString, { ...calculationHints, toProjectionExtent: [10, -60, 12, 60] })).toBeCloseTo(geodesicArea);
			// outside
			expect(getArea(lineString, { ...calculationHints, toProjectionExtent: [12, -60, 13, 60] })).toBeCloseTo(geodesicArea);
		});
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
		const lineString = new LineString([
			[0, 0],
			[15, 0]
		]);

		const delta = getPartitionDelta(lineString);

		expect(delta).toBe(1);
	});

	it('calculates a delta with standard resolution', () => {
		const lineString = new LineString([
			[0, 0],
			[200, 0]
		]);

		const delta = getPartitionDelta(lineString);

		expect(delta).toBe(0.5);
	});

	it('calculates a delta with defined resolution', () => {
		const lineString = new LineString([
			[0, 0],
			[5000, 0]
		]);
		const resolution = 50;
		const delta = getPartitionDelta(lineString, resolution);

		expect(delta).toBe(1);
	});

	it('calculates a delta for longest lines', () => {
		const lineString = new LineString([
			[0, 0],
			[50000000, 0]
		]);
		const resolution = 50;
		const delta = getPartitionDelta(lineString, resolution);

		expect(delta).toBe(0.2);
	});
});

describe('isValidGeometry', () => {
	it('validates Geometries', () => {
		expect(isValidGeometry(new Point([0, 0]))).toBeTrue();
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
				new Polygon([
					[
						[0, 0],
						[15, 0],
						[15, 15]
					]
				])
			)
		).toBeTrue();

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

describe('calculatePartitionResidualOfSegments', () => {
	it('calculates no residuals for a Point', () => {
		expect(calculatePartitionResidualOfSegments(new Point([0, 0]))).toEqual([]);
	});

	it('calculates residuals for a LineString', () => {
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
		expect(statsForNoGeometry.coordinate).toBeNull();
		expect(statsForNoGeometry.azimuth).toBeNull();
		expect(statsForNoGeometry.length).toBeNull();
		expect(statsForNoGeometry.area).toBeNull();
	});

	it('returns a statistic-object for Point', () => {
		const statsForPoint = getStats(new Point([42, 42]));
		expect(statsForPoint.coordinate).toEqual([42, 42]);
		expect(statsForPoint.azimuth).toBeNull();
		expect(statsForPoint.length).toBeNull();
		expect(statsForPoint.area).toBeNull();
	});

	it('returns a statistic-object for two-point LineString', () => {
		const statsForLineString = getStats(
			new LineString([
				[0, 0],
				[42, 42]
			])
		);
		expect(statsForLineString.coordinate).toBeNull();
		expect(statsForLineString.azimuth).toBe(45);
		expect(statsForLineString.length).toBeCloseTo(59.4, 1);
		expect(statsForLineString.area).toBeNull();
	});

	it('returns a statistic-object for n-point (2<n) LineString', () => {
		const statsForLineString = getStats(
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			])
		);
		expect(statsForLineString.coordinate).toBeNull();
		expect(statsForLineString.azimuth).toBeNull();
		expect(statsForLineString.length).toBeCloseTo(113.2, 1);
		expect(statsForLineString.area).toBeNull();
	});

	it('returns a statistic-object for MultiLineString', () => {
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
		expect(statsForMultiLineString.coordinate).toBeNull();
		expect(statsForMultiLineString.azimuth).toBeNull();
		expect(statsForMultiLineString.length).toBeCloseTo(165.5, 1);
		expect(statsForMultiLineString.area).toBeNull();
	});

	it('returns a statistic-object for Polygon', () => {
		const statsForPolygon = getStats(
			new Polygon([
				[
					[0, 0],
					[15, 0],
					[15, 15]
				]
			])
		);
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

		const multLineString = new MultiLineString([
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

			const fromMultiLineString = getLineString(multLineString);
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
		const pseudoMultLineString = new MultiLineString([
			new LineString([
				[0, 0],
				[42, 42],
				[3, 5]
			])
		]);

		const connectedMultLineString = new MultiLineString([
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

		const disconnectedMultLineString = new MultiLineString([
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
			expect(multiLineStringToLineString(point)).toBe(point);
			expect(multiLineStringToLineString(lineString)).toBe(lineString);
			expect(multiLineStringToLineString(linearRing)).toBe(linearRing);
			expect(multiLineStringToLineString(polygon)).toBe(polygon);
			expect(multiLineStringToLineString(disconnectedMultLineString)).toBe(disconnectedMultLineString);
		});

		it('creates a LineString', () => {
			const fromPseudoMultiLineString = getLineString(pseudoMultLineString);
			expect(fromPseudoMultiLineString).toBeInstanceOf(LineString);
			expect(fromPseudoMultiLineString.getCoordinates()).toEqual([
				[0, 0],
				[42, 42],
				[3, 5]
			]);

			const fromConnectedMultiLineString = getLineString(connectedMultLineString);
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
