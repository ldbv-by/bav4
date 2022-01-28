import { getGeometryLength, getArea, canShowAzimuthCircle, getCoordinateAt, getAzimuth, isVertexOfGeometry, getPartitionDelta, isValidGeometry, getStats } from '../../../../../src/modules/map/components/olMap/olGeometryUtils';
import { Point, MultiPoint, LineString, Polygon, Circle, LinearRing } from 'ol/geom';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('getGeometryLength', () => {
	it('calculates length of LineString', () => {
		const lineString = new LineString([[0, 0], [1, 0]]);
		const length = getGeometryLength(lineString);

		expect(length).toBe(1);
	});

	it('calculates length of LinearRing', () => {
		const linearRing = new LinearRing([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);
		const length = getGeometryLength(linearRing);

		expect(length).toBe(4);
	});

	it('calculates length of Polygon', () => {
		const polygon = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
		const length = getGeometryLength(polygon);

		expect(length).toBe(4);
	});


	it('calculates not length of Circle', () => {
		const circle = new Circle([0, 0], 1);
		const length = getGeometryLength(circle);

		expect(length).toBe(0);
	});

	it('calculates not length of null', () => {
		const length = getGeometryLength(null);

		expect(length).toBe(0);
	});
});

describe('canShowAzimuthCircle', () => {
	it('can show for a 2-point-line', () => {
		const twoPointLineString = new LineString([[0, 0], [1, 0]]);

		expect(canShowAzimuthCircle(twoPointLineString)).toBeTrue();
	});


	it('can show for a pseudo-2-point-line', () => {
		const threePointLineString = new LineString([[0, 0], [1, 0], [1, 0]]);

		expect(canShowAzimuthCircle(threePointLineString)).toBeTrue();
	});


	it('can NOT show for a point', () => {
		const point = new Point([0, 0]);

		expect(canShowAzimuthCircle(point)).toBeFalse();
	});


	it('can NOT show for lineString', () => {
		const threePointLineString = new LineString([[0, 0], [1, 0], [2, 1]]);

		expect(canShowAzimuthCircle(threePointLineString)).toBeFalse();
	});
});

describe('getAzimuth', () => {

	describe('when different geometryTypes', () => {
		it('calculates angle for a LineString', () => {
			const twoPointLineString = new LineString([[0, 0], [1, 0]]);

			expect(getAzimuth(twoPointLineString)).toBe(90);
		});

		it('calculates angle for a LinearRing', () => {
			const linearRing = new LinearRing([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);

			expect(getAzimuth(linearRing)).toBe(90);
		});

		it('calculates angle for a Polygon', () => {
			const polygon = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);

			expect(getAzimuth(polygon)).toBe(90);
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
			const twoPointLineString = new LineString([[0, 0], [0, 1]]);

			expect(getAzimuth(twoPointLineString)).toBe(0);
		});

		it('calculates angle for North-East', () => {
			const twoPointLineString = new LineString([[0, 0], [1, 1]]);

			expect(getAzimuth(twoPointLineString)).toBe(45);
		});

		it('calculates angle for East', () => {
			const twoPointLineString = new LineString([[0, 0], [1, 0]]);

			expect(getAzimuth(twoPointLineString)).toBe(90);
		});

		it('calculates angle for South-East', () => {
			const twoPointLineString = new LineString([[0, 0], [1, -1]]);

			expect(getAzimuth(twoPointLineString)).toBe(135);
		});

		it('calculates angle for South', () => {
			const twoPointLineString = new LineString([[0, 0], [0, -1]]);

			expect(getAzimuth(twoPointLineString)).toBe(180);
		});

		it('calculates angle for South-West', () => {
			const twoPointLineString = new LineString([[0, 0], [-1, -1]]);

			expect(getAzimuth(twoPointLineString)).toBe(225);
		});

		it('calculates angle for West', () => {
			const twoPointLineString = new LineString([[0, 0], [-1, 0]]);

			expect(getAzimuth(twoPointLineString)).toBe(270);
		});
	});
});

describe('getCoordinateAt', () => {
	it('calculates coordinate for LineString', () => {
		const lineString = new LineString([[0, 0], [2, 0]]);
		const coord = getCoordinateAt(lineString, 0.5);

		expect(coord[0]).toBe(1);
		expect(coord[1]).toBe(0);
	});


	it('calculates coordinate for LinearRing', () => {
		const linearRing = new LinearRing([[0, 0], [2, 0]]);
		const coord = getCoordinateAt(linearRing, 0.5);

		expect(coord[0]).toBe(1);
		expect(coord[1]).toBe(0);
	});

	it('calculates coordinate for Polygon', () => {
		const polygon = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
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
		const polygon = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
		const area = getArea(polygon);

		expect(area).toBe(1);
	});

	it('calculates the area for a projected Polygon', () => {
		const polygon = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
		const calculationHints = { fromProjection: 'EPSG:4326', toProjection: 'EPSG:25832' };
		const area = getArea(polygon, calculationHints);

		expect(area).toBeCloseTo(12575513411.866, 2);
	});

	it('returns 0 for a non-area-like geometry', () => {
		const point = new Point([0, 0]);
		const lineString = new LineString([[0, 0], [2, 0]]);
		const linearRing = new LinearRing([[0, 0], [2, 0]]);

		const pointArea = getArea(point);
		const lineStringArea = getArea(lineString);
		const linearRingArea = getArea(linearRing);

		expect(pointArea).toBe(0);
		expect(lineStringArea).toBe(0);
		expect(linearRingArea).toBe(0);
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
		const geometry = new MultiPoint([[0, 0], [0, 1]]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a MultiPoint', () => {
		const geometry = new MultiPoint([[0, 0], [0, 1]]);
		const vertexCandidate = new Point([0, 2]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves a Point as Vertex of a LineString', () => {
		const geometry = new LineString([[0, 0], [2, 0]]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a LineString', () => {
		const geometry = new LineString([[0, 0], [2, 0]]);
		const vertexCandidate = new Point([1, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves a Point as Vertex of a LinearRing', () => {
		const geometry = new LinearRing([[0, 0], [2, 0]]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a LinearRing', () => {
		const geometry = new LinearRing([[0, 0], [2, 0]]);
		const vertexCandidate = new Point([1, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves a Point as Vertex of a Polygon', () => {
		const geometry = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
		const vertexCandidate = new Point([0, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeTrue();
	});

	it('resolves NOT a Point as Vertex of a Polygon', () => {
		const geometry = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
		const vertexCandidate = new Point([0.5, 0]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});

	it('resolves to false when vertexCandidate is NOT Point', () => {
		const geometry = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
		const vertexCandidate = new LineString([[0, 0], [1, 0]]);

		const isVertex = isVertexOfGeometry(geometry, vertexCandidate);

		expect(isVertex).toBeFalse();
	});
});

describe('getPartitionDelta', () => {

	it('calculates a default delta', () => {
		const lineString = new LineString([[0, 0], [15, 0]]);

		const delta = getPartitionDelta(lineString);

		expect(delta).toBe(1);
	});

	it('calculates a delta with standard resolution', () => {
		const lineString = new LineString([[0, 0], [200, 0]]);

		const delta = getPartitionDelta(lineString);

		expect(delta).toBe(0.5);
	});

	it('calculates a delta with defined resolution', () => {
		const lineString = new LineString([[0, 0], [5000, 0]]);
		const resolution = 50;
		const delta = getPartitionDelta(lineString, resolution);

		expect(delta).toBe(1);
	});

	it('calculates a delta for longest lines', () => {
		const lineString = new LineString([[0, 0], [50000000, 0]]);
		const resolution = 50;
		const delta = getPartitionDelta(lineString, resolution);

		expect(delta).toBe(0.02);
	});
});

describe('isValidGeometry', () => {

	it('validates Geometries', () => {
		expect(isValidGeometry(new Point([0, 0]))).toBeTrue();
		expect(isValidGeometry(new LineString([[0, 0], [15, 0]]))).toBeTrue();
		expect(isValidGeometry(new Polygon([[[0, 0], [15, 0], [15, 15]]]))).toBeTrue();

		expect(isValidGeometry(null)).toBeFalse();
		expect(isValidGeometry(new Circle([0, 0], 10))).toBeFalse();
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

	it('returns a statistic-object for point', () => {

		const statsForNoGeometry = getStats(new Point([42, 42]));
		expect(statsForNoGeometry.coordinate).toEqual([42, 42]);
		expect(statsForNoGeometry.azimuth).toBeNull();
		expect(statsForNoGeometry.length).toBeNull();
		expect(statsForNoGeometry.area).toBeNull();
	});

	it('returns a statistic-object for two-point lineString', () => {

		const statsForNoGeometry = getStats(new LineString([[0, 0], [42, 42]]));
		expect(statsForNoGeometry.coordinate).toBeNull();
		expect(statsForNoGeometry.azimuth).toBeTruthy();
		expect(statsForNoGeometry.length).toBeTruthy();
		expect(statsForNoGeometry.area).toBeNull();
	});

	it('returns a statistic-object for n-point (2<n) lineString', () => {

		const statsForNoGeometry = getStats(new LineString([[0, 0], [42, 42], [3, 5]]));
		expect(statsForNoGeometry.coordinate).toBeNull();
		expect(statsForNoGeometry.azimuth).toBeNull();
		expect(statsForNoGeometry.length).toBeTruthy();
		expect(statsForNoGeometry.area).toBeNull();
	});

	it('returns a statistic-object for polygon', () => {

		const statsForNoGeometry = getStats(new Polygon([[[0, 0], [15, 0], [15, 15]]]));
		expect(statsForNoGeometry.coordinate).toBeNull();
		expect(statsForNoGeometry.azimuth).toBeNull();
		expect(statsForNoGeometry.length).toBeTruthy();
		expect(statsForNoGeometry.area).toBeTruthy();
	});
});


