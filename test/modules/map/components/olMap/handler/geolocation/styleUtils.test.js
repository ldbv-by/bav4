
import { geolocationStyleFunction, nullStyleFunction, createAnimateFunction } from '../../../../../../../src/modules/map/components/olMap/handler/geolocation/styleUtils';
import { Point, Circle } from 'ol/geom';
import Map from 'ol/Map';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { get as getProjection } from 'ol/proj';

import RenderEvent from 'ol/render/Event';

describe('geolocationStyleFunction', () => {
	it('should create a style for a point-feature', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });

		const styles = geolocationStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);

		const geolocationStyle = styles[0];
		expect(geolocationStyle.getFill()).toBeTruthy();
		expect(geolocationStyle.getStroke()).toBeTruthy();
		expect(geolocationStyle.getImage()).toBeTruthy();
	});

	it('should create a style for a Circle-feature', () => {
		const geometry = new Circle([[0, 0], 10]);
		const feature = new Feature({ geometry: geometry });

		const styles = geolocationStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);

		const geolocationStyle = styles[0];
		expect(geolocationStyle.getFill()).toBeTruthy();
		expect(geolocationStyle.getStroke()).toBeTruthy();
		expect(geolocationStyle.getImage()).toBeTruthy();
	});
});


describe('nullStyleFunction', () => {
	it('should create a empty style', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });

		const styles = nullStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);

		const nullStyle = styles[0];
		expect(nullStyle.getFill()).toBeFalsy();
		expect(nullStyle.getStroke()).toBeFalsy();
		expect(nullStyle.getImage()).toBeFalsy();
	});
});


describe('createAnimateFunction', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const transform = [1, 0, 0, 1, 0, 0];
	const projection = getProjection('EPSG:3857');
	const viewState = {
		projection: projection, resolution: 1, rotation: 0
	};

	const get2dContext = () => {
		const canvas = document.createElement('canvas');
		return canvas.getContext('2d');
	};


	const setupMap = () => {
		return new Map({
			target: 'map',
			view: new View({
				center: initialCenter,
				zoom: 1
			})
		});

	};
	const setupLayer = (map, feature) => {
		const source = new VectorSource({
			wrapX: false
		});
		const vector = new VectorLayer({
			source: source
		});
		source.addFeature(feature);
		map.addLayer(vector);
		return vector;
	};

	const setupFrameState = (time) => {
		return {
			time: +time, coordinateToPixelTransform: transform, viewHints: [], viewState: viewState
		};
	};

	const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), get2dContext());

	const getFeature = () => {
		const geometry = new Point([0, 0]);
		return new Feature({ geometry: geometry });
	};

	it('should create animation-function', () => {
		const feature = getFeature();
		const map = setupMap();
		const endCallback = () => { };

		const functionUnderTest = createAnimateFunction(map, feature, endCallback);

		expect(functionUnderTest).toBeDefined();
	});

	it('should avoid negative radius-values by edge-case framestate-times (framestate.time < start)', () => {
		const feature = getFeature();
		const map = setupMap();
		const layer = setupLayer(map, feature);
		const earlyEvent = getPostRenderEvent(Date.now() - 1000);
		const endCallback = () => { };

		const functionUnderTest = createAnimateFunction(map, feature, endCallback);
		layer.on('postrender', functionUnderTest);

		expect(() => layer.dispatchEvent(earlyEvent)).not.toThrow();
	});

	it('when animation ends, should NOT call the endCallback', () => {
		const feature = getFeature();
		const map = setupMap();
		const layer = setupLayer(map, feature);

		const endCallback = jasmine.createSpy();

		const functionUnderTest = createAnimateFunction(map, feature, endCallback);
		layer.on('postrender', functionUnderTest);
		layer.dispatchEvent(getPostRenderEvent(Date.now()));

		expect(functionUnderTest).toBeDefined();
		expect(endCallback).not.toHaveBeenCalled();

	});

	it('when animation ends, should call the endCallback', () => {
		const feature = getFeature();
		const map = setupMap();
		const layer = setupLayer(map, feature);

		const endCallback = jasmine.createSpy();

		const functionUnderTest = createAnimateFunction(map, feature, endCallback);
		layer.on('postrender', functionUnderTest);
		layer.dispatchEvent(getPostRenderEvent(Date.now()));

		expect(functionUnderTest).toBeDefined();

		layer.dispatchEvent(getPostRenderEvent(Date.now() + 1100));
		expect(endCallback).toHaveBeenCalled();

	});
});
