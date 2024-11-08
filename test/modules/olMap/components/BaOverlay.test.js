import { LineString, Point, Polygon } from 'ol/geom';
import { BaOverlay, BaOverlayTypes } from '../../../../src/modules/olMap/components/BaOverlay';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection/index.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';
import { PROJECTED_LENGTH_GEOMETRY_PROPERTY } from '../../../../src/modules/olMap/utils/olGeometryUtils.js';

window.customElements.define(BaOverlay.tag, BaOverlay);

describe('BaOverlay', () => {
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
	const mapServiceMock = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
		getLocalProjectedSridExtent: () => null,
		calcLength: () => {},
		calcArea: () => {}
	};

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
		// eslint-disable-next-line no-unused-vars
		$injector.registerSingleton('UnitsService', unitServiceMock).registerSingleton('MapService', mapServiceMock);
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
	});

	const setup = async (properties = {}) => {
		const element = await TestUtils.render(BaOverlay.tag);

		// transform test-geometries from assumed default geodetic projection to default map-projection
		if (properties.geometry) {
			properties.geometry.transform('EPSG:25832', 'EPSG:3857');
		}
		for (const property in properties) {
			element[property] = properties[property];
		}
		return element;
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new BaOverlay().getModel();

			expect(model).toEqual({
				value: null,
				floating: true,
				overlayType: BaOverlayTypes.TEXT,
				draggable: false,
				placement: { sector: 'init', positioning: 'top-center', offset: [0, -25] },
				geometryRevision: null,
				position: null
			});
		});

		it('has a model accessible by properties ', async () => {
			await setup();
			const classUnderTest = new BaOverlay();

			expect(classUnderTest.placement).toEqual({ sector: 'init', positioning: 'top-center', offset: [0, -25] });
			expect(classUnderTest.value).toBeNull();
			expect(classUnderTest.type).toBe(BaOverlayTypes.TEXT);
			expect(classUnderTest.isDraggable).toBeFalse();
			expect(classUnderTest.static).toBeFalse();
			expect(classUnderTest.geometry).toBeNull();
			expect(classUnderTest.position).toBeNull();
		});
	});

	describe('when initialized with type property', () => {
		it('renders the text view', async () => {
			const element = await setup();

			expect(element.type).toBe(BaOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe(null);
		});

		it('renders the help view', async () => {
			const properties = { type: BaOverlayTypes.HELP, value: 'foo' };
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('ba-overlay')).toBeTrue();
			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.classList.contains('static')).toBeFalse();
			expect(element.type).toBe(BaOverlayTypes.HELP);
			expect(element.static).toBeFalse();
			expect(element.value).toBe('foo');
		});

		it("have no effect on rendering the help view, when static is set to 'true' ", async () => {
			const properties = { type: BaOverlayTypes.HELP, value: 'foo', static: true };
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('ba-overlay')).toBeTrue();
			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.classList.contains('static')).toBeFalse();
			expect(element.type).toBe(BaOverlayTypes.HELP);
			expect(element.static).toBeTrue();
			expect(element.value).toBe('foo');
		});

		it('renders the distance view', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = {
				type: BaOverlayTypes.DISTANCE,
				geometry: geodeticGeometry
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('ba-overlay')).toBeTrue();
			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(div.innerText).toBe('90.00°/THE DISTANCE IN m');
			expect(element.type).toBe(BaOverlayTypes.DISTANCE);
			expect(element.static).toBeFalse();
			expect(element.getModel().geometryRevision).not.toBeNull();
		});

		it('renders the distance view without azimuth angle', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1, 0],
				[1, 1]
			]);
			const properties = {
				type: BaOverlayTypes.DISTANCE,
				geometry: geodeticGeometry
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('ba-overlay')).toBeTrue();
			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(div.innerText).toBe('THE DISTANCE IN m');
			expect(element.type).toBe(BaOverlayTypes.DISTANCE);
			expect(element.static).toBeFalse();
			expect(element.getModel().geometryRevision).not.toBeNull();
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
				type: BaOverlayTypes.AREA,
				geometry: geodeticGeometry
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('ba-overlay')).toBeTrue();
			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(div.innerText).toBe('THE AREA IN m²');
			expect(element.type).toBe(BaOverlayTypes.AREA);
			expect(element.static).toBeFalse();
			expect(element.getModel().geometryRevision).not.toBeNull();
		});

		it('does NOT render the area view', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[10, 0],
				[10, 10],
				[0, 10]
			]);
			const properties = {
				type: BaOverlayTypes.AREA,
				geometry: geodeticGeometry
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('ba-overlay')).toBeTrue();
			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(div.innerText).toBe('');
			expect(element.type).toBe(BaOverlayTypes.AREA);
			expect(element.static).toBeFalse();
			expect(element.getModel().geometryRevision).not.toBeNull();
		});

		it('renders the distance-partition view', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[100, 0]
			]);
			const properties = {
				type: BaOverlayTypes.DISTANCE_PARTITION,
				geometry: geodeticGeometry,
				value: 0.1
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('partition')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(div.innerText).toBe('THE DISTANCE IN m');
			expect(element.type).toBe(BaOverlayTypes.DISTANCE_PARTITION);
			expect(element.static).toBeFalse();
			expect(element.getModel().geometryRevision).not.toBeNull();
		});

		it('renders the distance-partition view with rounded values (up)', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1000, 0]
			]);
			geodeticGeometry.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 1000);
			const properties = {
				type: BaOverlayTypes.DISTANCE_PARTITION,
				value: 0.099,
				geometry: geodeticGeometry
			};
			const spy = spyOn(unitServiceMock, 'formatDistance').and.callThrough();
			const element = await setup(properties);
			element.value = 0.099;

			expect(element.shadowRoot.querySelector('div').innerText).toBe('THE DISTANCE IN m');
			expect(spy).toHaveBeenCalledWith(100, 0);
		});

		it('renders the distance-partition view with rounded values (down)', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1000, 0]
			]);
			geodeticGeometry.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 1000);
			const properties = {
				type: BaOverlayTypes.DISTANCE_PARTITION,
				value: 0.1001,
				geometry: geodeticGeometry
			};
			const spy = spyOn(unitServiceMock, 'formatDistance').and.callThrough();
			const element = await setup(properties);

			expect(element.shadowRoot.querySelector('div').innerText).toBe('THE DISTANCE IN m');
			expect(spy).toHaveBeenCalledWith(100, 0);
		});

		it('renders the static distance view', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = {
				type: BaOverlayTypes.DISTANCE,
				geometry: geodeticGeometry,
				static: true
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('static')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.innerText).toBe('90.00°/THE DISTANCE IN m');
			expect(element.type).toBe(BaOverlayTypes.DISTANCE);
		});

		it('renders formatted distance', async () => {
			const geodeticGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = {
				type: BaOverlayTypes.DISTANCE,
				geometry: geodeticGeometry
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/THE DISTANCE IN m');
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
				type: BaOverlayTypes.AREA,
				geometry: geodeticGeometry
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(div.innerText).toBe('THE AREA IN m²');
			expect(element.type).toBe(BaOverlayTypes.AREA);
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

		it('does NOT render the view, while value is not changed', async () => {
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

	describe('when value changed', () => {
		it('renders the changed view', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();
			expect(element.value).toBe(null);

			element.value = 'Foo';

			expect(element.value).toBe('Foo');
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it('does NOT render the view, when value is unchanged', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.value = 'Foo';
			element.value = 'Foo';

			expect(element.value).toBe('Foo');
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('when type changed', () => {
		it('renders the changed view', async () => {
			const element = await setup();
			const div = element.shadowRoot.querySelector('div');

			expect(element.type).toBe(BaOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe(null);

			element.type = BaOverlayTypes.HELP;

			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(element.type).toBe(BaOverlayTypes.HELP);
			expect(element.static).toBeFalse();
		});

		it('does NOT render the view, when type value is unchanged', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.type = BaOverlayTypes.HELP;
			element.type = BaOverlayTypes.HELP;

			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('when geometry changed', () => {
		it('updates the position', async () => {
			const geometry = new Point([0, 0]);
			const element = await setup();

			expect(element.geometry).toBeNull();
			expect(element.position).toBeNull();

			element.geometry = geometry;

			expect(element.geometry).toBe(geometry);
			expect(element.position).toEqual([0, 0]);
		});
	});

	describe('when draggable changed', () => {
		it('renders the changed view', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.isDraggable = true;

			expect(spy).toHaveBeenCalled();
		});

		it('does NOT render the view, when draggable-value is unchanged', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.isDraggable = true;
			element.isDraggable = true;

			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('when static changed', () => {
		it('renders the changed view', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();
			expect(element.static).toBeFalse();

			element.static = true;

			expect(element.static).toBeTrue();
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it('does NOT render the view, when type value is unchanged', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.static = true;
			element.static = true;

			expect(spy).toHaveBeenCalledTimes(1);
		});
	});
});
