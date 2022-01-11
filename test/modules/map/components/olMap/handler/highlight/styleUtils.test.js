
import { createAnimation, highlightAnimatedCoordinateFeatureStyleFunction, highlightCoordinateFeatureStyleFunction, highlightGeometryFeatureStyleFunction, highlightTemporaryCoordinateFeatureStyleFunction, highlightTemporaryGeometryFeatureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/styleUtils';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { sleep } from '../../../../../../../src/utils/sleep';
import CircleStyle from 'ol/style/Circle';
import locationIcon from '../../../../../../../src/modules/map/components/olMap/handler/highlight/assets/location.svg';
import tempLocationIcon from '../../../../../../../src/modules/map/components/olMap/handler/highlight//assets/temporaryLocation.svg';
import { fromLonLat, get as getProjection } from 'ol/proj';
import { Feature, View, Map } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import RenderEvent from 'ol/render/Event';
import Point from 'ol/geom/Point';


describe('styleUtils', () => {

	describe('highlightCoordinateStyleFunction', () => {

		it('should return a style function', () => {
			const style = new Style({
				image: new Icon({
					anchor: [0.5, 1],
					anchorXUnits: 'fraction',
					anchorYUnits: 'fraction',
					src: locationIcon
				})
			});
			const styles = highlightCoordinateFeatureStyleFunction();

			expect(styles).toEqual([style]);
		});
	});

	describe('highlightCoordinateTemporaryFeatureStyleFunction', () => {

		it('should return a style function', () => {
			const style = new Style({
				image: new Icon({
					anchor: [0.5, 1],
					anchorXUnits: 'fraction',
					anchorYUnits: 'fraction',
					src: tempLocationIcon
				})
			});

			const styles = highlightTemporaryCoordinateFeatureStyleFunction();

			expect(styles).toEqual([style]);
		});
	});

	describe('highlightGeometryFeatureStyleFunction', () => {

		it('should return a style function', () => {

			const selectStroke = new Stroke({
				color: [255, 128, 0, 1],
				width: 3
			});

			const selectFill = new Fill({
				color: [255, 255, 0, 0.3]
			});
			const selectStyle = new Style({
				fill: selectFill,
				stroke: selectStroke,
				image: new CircleStyle({
					radius: 10,
					fill: selectFill,
					stroke: selectStroke
				})
			});

			const styles = highlightGeometryFeatureStyleFunction();

			expect(styles).toEqual([selectStyle]);
		});
	});

	describe('highlightTemporaryGeometryFeatureStyleFunction', () => {

		it('should return a style function', () => {

			const hlStroke = new Stroke({
				color: [255, 128, 0, 1],
				width: 6
			});

			const hlFill = new Fill({
				color: [255, 128, 0, 1]
			});

			const hlStyle = new Style({
				fill: hlFill,
				stroke: hlStroke,
				image: new CircleStyle({
					radius: 10,
					fill: hlFill,
					stroke: hlStroke
				})
			});

			const styles = highlightTemporaryGeometryFeatureStyleFunction();

			expect(styles).toEqual([hlStyle]);
		});
	});

	describe('highlightAnimatedCoordinateFeatureStyleFunction', () => {

		it('should return a style function', () => {

			const selectStroke = new Stroke(
				{
					color: [255, 255, 255, 1],
					width: 2
				}
			);
			const selectFill = new Fill({
				color: [9, 157, 221, 1]
			});

			const style = new Style({
				fill: selectFill,
				image: new CircleStyle({
					radius: 9,
					fill: selectFill,
					stroke: selectStroke
				})
			});
			const styles = highlightAnimatedCoordinateFeatureStyleFunction();

			expect(styles).toEqual([style]);
		});
	});

	describe('createAnimation', () => {
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

		const getPostRenderEvent = (time, ctx = get2dContext()) => new RenderEvent('postrender', transform, setupFrameState(time), ctx);

		const getFeature = () => {
			const geometry = new Point([0, 0]);
			return new Feature({ geometry: geometry });
		};

		it('should create animation function', () => {
			const feature = getFeature();
			const map = setupMap();
			const endCallback = () => { };

			const functionUnderTest = createAnimation(map, feature, endCallback);

			expect(functionUnderTest).toBeDefined();
		});

		it('should avoid negative radius-values by edge-case framestate-times (framestate.time < start)', () => {
			const feature = getFeature();
			const map = setupMap();
			const layer = setupLayer(map, feature);
			const earlyEvent = getPostRenderEvent(Date.now() - 1000);
			const endCallback = () => { };

			const functionUnderTest = createAnimation(map, feature, endCallback);
			layer.on('postrender', functionUnderTest);

			expect(() => layer.dispatchEvent(earlyEvent)).not.toThrow();
		});

		it('when duration loop expires, animation should restart', async () => {
			const feature = getFeature();
			const map = setupMap();
			const layer = setupLayer(map, feature);
			const callsForStaticStyle = 1;
			const callsForDurationDependingStyleStart = 1;
			const callsForDurationDependingStyleEnd = 7;
			const duration = 1500;

			const context = get2dContext();
			const contextSpy = spyOn(context, 'drawImage').and.callThrough();

			const functionUnderTest = createAnimation(map, feature);
			layer.on('postrender', functionUnderTest);

			expect(functionUnderTest).toBeDefined();
			// render first animation-step
			layer.dispatchEvent(getPostRenderEvent(Date.now(), context));
			expect(contextSpy).toHaveBeenCalledTimes(callsForStaticStyle + callsForDurationDependingStyleStart);
			await sleep(duration + 100);
			// render last animation-step and restart
			layer.dispatchEvent(getPostRenderEvent(Date.now(), context));
			expect(contextSpy.calls.count()).toBeGreaterThanOrEqual(callsForStaticStyle + callsForDurationDependingStyleEnd);
			contextSpy.calls.reset();
			// render again first animation-step
			layer.dispatchEvent(getPostRenderEvent(Date.now(), context));
			expect(contextSpy).toHaveBeenCalledTimes(callsForStaticStyle + callsForDurationDependingStyleStart);
		});
	});
});
