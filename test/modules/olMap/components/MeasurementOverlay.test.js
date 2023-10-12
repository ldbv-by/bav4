import { MeasurementOverlay, MeasurementOverlayTypes } from '../../../../src/modules/olMap/components/MeasurementOverlay';
import { LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils.js';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);

describe('MeasurementOverlay', () => {
	const unitServiceMock = {
		// eslint-disable-next-line no-unused-vars
		formatDistance(distance, decimals) {
			return 'THE DISTANCE IN m';
		},
		// eslint-disable-next-line no-unused-vars
		formatArea(area, decimals) {
			return 'THE AREA IN m²';
		}
	};

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('UnitsService', unitServiceMock)
			.registerSingleton('MapService', { getSrid: () => 3857, getLocalProjectedSrid: () => 25832, getLocalProjectedSridExtent: () => null });
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
	});

	const setup = async (properties = {}) => {
		const element = await TestUtils.render(MeasurementOverlay.tag);

		// transform test-geometries from assumed default geodetic projection to default map-projection
		if (properties.geometry) {
			properties.geometry.transform('EPSG:25832', 'EPSG:3857');
		}
		for (const property in properties) {
			element[property] = properties[property];
		}
		return element;
	};

	describe('when initialized with type property', () => {
		it('renders the text view', async () => {
			const element = await setup();

			expect(element.type).toBe(MeasurementOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe(null);
			expect(element.innerText).toBe(null);
		});

		it('renders the help view', async () => {
			const properties = { type: MeasurementOverlayTypes.HELP, value: 'foo' };
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.classList.contains('static')).toBeFalse();
			expect(element.type).toBe(MeasurementOverlayTypes.HELP);
			expect(element.static).toBeFalse();
			expect(element.value).toBe('foo');
			expect(element.innerText).toBe('foo');
		});

		it('renders the distance view', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = {
				type: MeasurementOverlayTypes.DISTANCE,
				geometry: geodeticGeometry,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);
			expect(element.static).toBeFalse();
			expect(element.innerText).toBe('90.00°/THE DISTANCE IN m');
		});

		it('renders the area view', async () => {
			const geodeticGeometry = new Polygon([
				[
					[0, 0],
					[10, 0],
					[10, 10],
					[0, 10],
					[0, 0]
				]
			]);
			const properties = {
				type: MeasurementOverlayTypes.AREA,
				geometry: geodeticGeometry,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.AREA);
			expect(element.static).toBeFalse();
			expect(element.innerText).toBe('THE AREA IN m²');
		});

		it('renders the distance-partition view', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[100, 0]
			]);
			const properties = {
				type: MeasurementOverlayTypes.DISTANCE_PARTITION,
				geometry: geodeticGeometry,
				value: 0.1,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('partition')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE_PARTITION);
			expect(element.static).toBeFalse();
			expect(element.innerText).toBe('THE DISTANCE IN m');
		});

		it('renders the distance-partition view with rounded values (up)', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1000, 0]
			]);
			const properties = {
				type: MeasurementOverlayTypes.DISTANCE_PARTITION,
				geometry: geodeticGeometry,
				value: 0.099,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const spy = spyOn(unitServiceMock, 'formatDistance').and.callThrough();
			const element = await setup(properties);

			expect(element.innerText).toBe('THE DISTANCE IN m');
			expect(spy).toHaveBeenCalledWith(100, 0);
		});

		it('renders the distance-partition view with rounded values (down)', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1000, 0]
			]);
			const properties = {
				type: MeasurementOverlayTypes.DISTANCE_PARTITION,
				geometry: geodeticGeometry,
				value: 0.1001,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const spy = spyOn(unitServiceMock, 'formatDistance').and.callThrough();
			const element = await setup(properties);

			expect(element.innerText).toBe('THE DISTANCE IN m');
			expect(spy).toHaveBeenCalledWith(100, 0);
		});

		it('renders the static distance view', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = {
				type: MeasurementOverlayTypes.DISTANCE,
				geometry: geodeticGeometry,
				static: true,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('static')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);
			expect(element.innerText).toBe('90.00°/THE DISTANCE IN m');
		});

		it('renders formatted distance', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = {
				type: MeasurementOverlayTypes.DISTANCE,
				geometry: geodeticGeometry,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const element = await setup(properties);

			expect(element.innerText).toBe('90.00°/THE DISTANCE IN m');
		});

		it('renders formatted area', async () => {
			const geodeticGeometry = new Polygon([
				[
					[0, 0],
					[120, 0],
					[120, 120],
					[0, 120],
					[0, 0]
				]
			]);
			const properties = {
				type: MeasurementOverlayTypes.AREA,
				geometry: geodeticGeometry,
				projectionHints: { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' }
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.AREA);
			expect(element.static).toBeFalse();
			expect(element.innerText).toBe('THE AREA IN m²');
		});
	});

	describe('when type changed', () => {
		it('renders the changed view', async () => {
			const element = await setup();
			const div = element.shadowRoot.querySelector('div');

			expect(element.type).toBe(MeasurementOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe(null);

			element.type = MeasurementOverlayTypes.DISTANCE;

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);
			expect(element.static).toBeFalse();
		});
	});

	describe('when placement changed', () => {
		it('renders the changed view', async () => {
			const element = await setup();
			const renderSpy = spyOn(element, 'render').and.callThrough();
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('init')).toBeTrue();

			element.placement = { sector: 'top', positioning: 'top-center', offset: [0, -25] };

			expect(renderSpy).toHaveBeenCalled();
			expect(div.classList.contains('top')).toBeTrue();
		});

		it('does NOT renders the view, while value is not changed', async () => {
			const element = await setup();
			const renderSpy = spyOn(element, 'render').and.callThrough();
			const div = element.shadowRoot.querySelector('div');
			const initialPlacement = element.placement;

			expect(div.classList.contains('init')).toBeTrue();

			element.placement = initialPlacement;

			expect(renderSpy).not.toHaveBeenCalled();
			expect(div.classList.contains('init')).toBeTrue();
		});
	});
});
