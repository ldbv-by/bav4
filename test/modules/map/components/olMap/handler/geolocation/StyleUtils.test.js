
import { geolocationStyleFunction, getFlashAnimation } from '../../../../../../../src/modules/map/components/olMap/handler/geolocation/StyleUtils';
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
	});

	it('should create a style for a Circle-feature', () => {
		const geometry = new Circle([[0, 0], 10]);
		const feature = new Feature({ geometry: geometry });

		const styles = geolocationStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});
});

describe('getFlashAnimation', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const setupMap = () => {
		return new Map({
			target: 'map',
			view: new View({
				center: initialCenter,
				zoom: 1,
			}),
		});

	};
	const setupLayer = (map, feature) => {	
		const source = new VectorSource({
			wrapX: false,
		});
		const vector = new VectorLayer({
			source: source,
		});
		source.addFeature(feature);
		map.addLayer(vector);
		return vector;
	};


	it('should create animation-function', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });
		const map = setupMap();		
		const endCallback = () => {};
		
		const functionUnderTest = getFlashAnimation(map, feature, endCallback);
				
		expect(functionUnderTest).toBeDefined();
	});

	it('when animation ends, should call the endCallback', () => {
		const projection = getProjection('EPSG:3857');
		const inversePixelTransform = [1, 0, 0, 1, 0, 0];
		const startFrameState = { time:+new Date(),
			coordinateToPixelTransform:[1, 0, 0, 1, 0, 0],
			viewHints: [],
			viewState: { projection: projection, resolution: 1, rotation: 0,
			}, };
		const endFrameState = { time:+new Date() + 5000,
			coordinateToPixelTransform:[1, 0, 0, 1, 0, 0],
			viewHints: [],
			viewState: { projection: projection, resolution: 1, rotation: 0,
			}, };
	
		const context = { setTransform:() => {}, translate:() => {}, scale:() => {}, drawImage:() => {} };
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });
		const map = setupMap();
		const layer = setupLayer(map, feature);
		
		const endCallback = jasmine.createSpy();		
		
		const functionUnderTest = getFlashAnimation(map, feature, endCallback);
		layer.on('postrender', functionUnderTest);
		layer.dispatchEvent(new RenderEvent('postrender', inversePixelTransform, startFrameState, context)	);

		expect(functionUnderTest).toBeDefined();

		layer.dispatchEvent(new RenderEvent('postrender', inversePixelTransform, endFrameState, context)	);
		expect(endCallback).toHaveBeenCalled();

	});
});
