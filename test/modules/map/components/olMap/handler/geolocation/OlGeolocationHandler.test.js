import { OlGeolocationHandler } from '../../../../../../../src/modules/map/components/olMap/handler/geolocation/OlGeolocationHandler';
import { activate as activateGeolocation, setAccuracy, setPosition } from '../../../../../../../src/store/geolocation/geolocation.action';
import { setBeingDragged } from '../../../../../../../src/store/pointer/pointer.action';
import { TestUtils } from '../../../../../../test-utils';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import { OSM, TileDebug } from 'ol/source';
import { pointerReducer } from '../../../../../../../src/store/pointer/pointer.reducer';
import { geolocationReducer } from '../../../../../../../src/store/geolocation/geolocation.reducer';

describe('OlGeolocationHandler', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialState = {
		active: false,
		denied: false,
		tracking: false,
		accuracy: null,
		position: null
	};
	const setup = (state = initialState) => {
		const geolocationState = {
			geolocation: state,
			pointer: { beingDragged: false }
		};
		TestUtils.setupStoreAndDi(geolocationState, { geolocation: geolocationReducer, pointer: pointerReducer });
	};

	const setupMap = () => {
		const container = document.createElement('div');
		return new Map({
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				new TileLayer({
					source: new TileDebug()
				})],
			target: container,
			view: new View({
				center: initialCenter,
				zoom: 1
			})
		});

	};

	it('instantiates the handler', () => {
		setup();
		const handler = new OlGeolocationHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('geolocation_layer');
		expect(handler._storeService.getStore()).toBeDefined();
		expect(handler._unregister).not.toBeDefined();
		expect(handler.options).toEqual({ preventDefaultClickHandling: false, preventDefaultContextClickHandling: false });
	});

	describe('when activate', () => {
		const getStyles = (feature) => {
			const styleFunction = feature.getStyle();
			return styleFunction(feature);
		};

		it('registers observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlGeolocationHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._unregister).toBeDefined();
		});

		describe('when geolocation-state changed', () => {

			it('positions accuracy- and position-feature on position', () => {
				const map = setupMap();
				setup();


				const handler = new OlGeolocationHandler();
				handler.activate(map);

				setPosition([38, 57]);
				setAccuracy(42);
				activateGeolocation();

				expect(handler._accuracyFeature).toBeDefined();
				expect(handler._positionFeature).toBeDefined();

				expect(handler._accuracyFeature.getGeometry().getCenter()).toEqual([38, 57]);
				expect(handler._positionFeature.getGeometry().getCoordinates()).toEqual([38, 57]);
			});


			it('does NOT position accuracy- and position-feature with invalid position', () => {
				const map = setupMap();
				setup();


				const handler = new OlGeolocationHandler();
				handler.activate(map);

				setPosition([38, 57]);
				setAccuracy(null);
				activateGeolocation();

				expect(handler._accuracyFeature).toBeDefined();
				expect(handler._positionFeature).toBeDefined();

				expect(handler._accuracyFeature.getGeometry()).toBeUndefined();
				expect(handler._positionFeature.getGeometry()).toBeUndefined();

				const accuracyStyle = getStyles(handler._accuracyFeature)[0];
				const positionStyle = getStyles(handler._positionFeature)[0];

				expect(accuracyStyle.getFill()).toBeFalsy();
				expect(accuracyStyle.getStroke()).toBeFalsy();
				expect(accuracyStyle.getImage()).toBeFalsy();
				expect(positionStyle.getFill()).toBeFalsy();
				expect(positionStyle.getStroke()).toBeFalsy();
				expect(positionStyle.getImage()).toBeFalsy();
			});

			it('does NOT position accuracy- and position-feature with invalid accuracy', () => {
				const map = setupMap();
				setup();


				const handler = new OlGeolocationHandler();
				handler.activate(map);

				setPosition(null);
				setAccuracy(42);
				activateGeolocation();

				expect(handler._accuracyFeature).toBeDefined();
				expect(handler._positionFeature).toBeDefined();

				expect(handler._accuracyFeature.getGeometry()).toBeUndefined();
				expect(handler._positionFeature.getGeometry()).toBeUndefined();

				const accuracyStyle = getStyles(handler._accuracyFeature)[0];
				const positionStyle = getStyles(handler._positionFeature)[0];

				expect(accuracyStyle.getFill()).toBeFalsy();
				expect(accuracyStyle.getStroke()).toBeFalsy();
				expect(accuracyStyle.getImage()).toBeFalsy();
				expect(positionStyle.getFill()).toBeFalsy();
				expect(positionStyle.getStroke()).toBeFalsy();
				expect(positionStyle.getImage()).toBeFalsy();
			});

			it('pauses blink-animation while map is dragged', () => {
				const map = setupMap();
				setup();


				const handler = new OlGeolocationHandler();
				const blinkSpy = spyOn(handler, '_blinkPosition');
				handler.activate(map);

				setPosition([38, 57]);
				setAccuracy(42);
				activateGeolocation();
				setAccuracy(38);
				setAccuracy(57);

				expect(blinkSpy).toHaveBeenCalledTimes(4);

				setBeingDragged(true);
				setAccuracy(42);
				setBeingDragged(false);
				expect(blinkSpy).toHaveBeenCalledTimes(4);
				setAccuracy(4);
				expect(blinkSpy).toHaveBeenCalledTimes(5);
			});
		});
		describe('when geolocation-request is denied', () => {

			it('sets accuracy- and position-feature to default', () => {
				const map = setupMap();
				const state = { ...initialState, denied: true };
				setup(state);


				const handler = new OlGeolocationHandler();
				handler.activate(map);

				setPosition([38, 57]);
				setAccuracy(42);
				activateGeolocation();

				expect(handler._accuracyFeature).toBeDefined();
				expect(handler._positionFeature).toBeDefined();
				expect(handler._accuracyFeature.getGeometry()).toBeUndefined();
				expect(handler._positionFeature.getGeometry()).toBeUndefined();

				const accuracyStyle = getStyles(handler._accuracyFeature)[0];
				const positionStyle = getStyles(handler._positionFeature)[0];

				expect(accuracyStyle.getFill()).toBeFalsy();
				expect(accuracyStyle.getStroke()).toBeFalsy();
				expect(accuracyStyle.getImage()).toBeFalsy();
				expect(positionStyle.getFill()).toBeFalsy();
				expect(positionStyle.getStroke()).toBeFalsy();
				expect(positionStyle.getImage()).toBeFalsy();
			});

		});
	});

	describe('when deactivate', () => {
		it('unregisters observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlGeolocationHandler();
			handler.activate(map);
			const spyOnUnregister = spyOn(handler, '_unregister');


			handler.deactivate(map);

			expect(handler._geolocationLayer).toBeNull();
			expect(spyOnUnregister).toHaveBeenCalled();
		});


	});


	describe('when toggle activate/deactivate', () => {
		it('uses correct styles per state', () => {
			const map = setupMap();
			setup();

			const handler = new OlGeolocationHandler();
			handler.activate(map);

			const positionFeature = handler._positionFeature;

			handler.deactivate(map);
			const nullStyleFunction = positionFeature.getStyle();
			const nullStyle = nullStyleFunction(positionFeature)[0];
			expect(nullStyle).toBeDefined();

			expect(nullStyle.getFill()).toBeNull();
			expect(nullStyle.getStroke()).toBeNull();
			expect(nullStyle.getImage()).toBeNull();


			handler.activate(map);
			const geolocationStyleFunction = positionFeature.getStyle();
			const geolocationStyle = geolocationStyleFunction(positionFeature)[0];
			expect(geolocationStyle).toBeDefined();
			expect(geolocationStyle.getFill()).toBeTruthy();
			expect(geolocationStyle.getStroke()).toBeTruthy();
			expect(geolocationStyle.getImage()).toBeTruthy();
		});


	});
});
