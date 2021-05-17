import { create } from '../../../../../../src/modules/map/components/olMap/formats/kml';
import { Point, LineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Circle, Fill, Stroke } from 'ol/style';


describe('kml', () => {
	const projection = 'EPSG:3857';
	const aPolygonFeature =  new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
	const aLineStringAsPolygonFeature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1]]]) });
	
    
	const createLayerMock = (features) => {
		return { 
			label:'Foo', 
			getSource() {
				return {
					getFeatures:() => features 
				};
			},
			getStyleFunction() {
				return null;
			} };
            
	};

	const addStyleFunctionTo = (feature) => {
		const fill = new Fill({
			color: [255, 255, 255, 0.4]
		});
		const stroke = new Stroke({
			color: '#3399CC',
			width: 1.25
		});

		const style = new Style({
			image: new Circle({
				fill: fill,
				stroke: stroke,
				radius: 5
			}),
			fill: fill,
			stroke: stroke
		});
		feature.setStyle(() => [style]);
	};
	describe('create', () => {
		
		it('creates a string', () => {
			const features = [aPolygonFeature];
			const layer = createLayerMock(features);
            
			const actual = create(layer, projection);

			expect(actual).toEqual(jasmine.any(String));
		});

		it('rectifies polygon to linestring before export', () => {
			const features = [aLineStringAsPolygonFeature];
			const layer = createLayerMock(features);
            
			const actual = create(layer, projection);

			const containsLineStringData = actual.includes('LineString');
			const containsPolygonData = actual.includes('Polygon') || actual.includes('outerBoundaryIs') || actual.includes('LinearRing');			
			expect(containsLineStringData).toBeTrue();
			expect(containsPolygonData).toBeFalse();
		});

		it('reads and converts style-properties from feature', () => {
			addStyleFunctionTo(aPolygonFeature);
			const features = [aPolygonFeature];
			const layer = createLayerMock(features);
            
			const actual = create(layer, projection);

			const containsLineStyle = actual.includes('LineStyle') && actual.includes('<color>ffcc9933</color>');
			const containsPolyStyle = actual.includes('PolyStyle')  && actual.includes('<color>66ffffff</color>');			
			expect(containsLineStyle).toBeTrue();
			expect(containsPolyStyle).toBeTrue();
		});

	});
});