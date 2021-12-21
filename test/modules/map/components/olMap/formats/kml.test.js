import { create, toKmlStyleProperties } from '../../../../../../src/modules/map/components/olMap/formats/kml';
import { Point, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Circle, Fill, Stroke, Text, Icon } from 'ol/style';
import { $injector } from '../../../../../../src/injection';


describe('kml', () => {
	const projection = 'EPSG:3857';
	const aPointFeature = new Feature({ geometry: new Point([0, 0]) });
	const aPolygonFeature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
	const aLineStringAsPolygonFeature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1]]]) });

	const iconServiceMock = {
		getIconResult: (idOrBase64) => {
			return { getUrl: (color) => `backend.url/icon/${color}/${idOrBase64.substr(idOrBase64.length - 5)}` };
		}
	};
	$injector.registerSingleton('IconService', iconServiceMock);

	const createLayerMock = (features, withLabel = true) => {
		const layerMock = {
			getSource() {
				return {
					getFeatures: () => features
				};
			},
			getStyleFunction() {
				return null;
			}
		};

		return withLabel ? { ...layerMock, label: 'Foo' } : layerMock;
	};

	const getAStyleFunction = () => {
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
		return () => [style];
	};

	const getATextStyleFunction = () => {
		const fill = new Fill({
			color: [255, 255, 255, 0.4]
		});

		const stroke = new Stroke({
			color: '#3399CC',
			width: 1.25
		});
		const text = new Text({
			text: 'Foo',
			fill: fill,
			stroke: stroke
		});

		const style = new Style({
			text: text,
			fill: fill,
			stroke: stroke
		});
		return () => [style];
	};

	const getAIconStyleFunction = (color, iconSrc, scale = 1) => {
		const iconOptions = {
			anchor: [0.5, 1],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			src: iconSrc,
			color: color,
			scale: scale
		};

		const style = new Style({
			image: new Icon(iconOptions)
		});
		return () => [style];
	};

	const getANoneStyleFunction = () => {
		return () => [];
	};

	const getASingleEmptyStyleFunction = () => {
		return () => new Style();
	};
	describe('create', () => {
		beforeEach(() => {
			aPointFeature.setStyle(null);
			aPolygonFeature.setStyle(null);
			aLineStringAsPolygonFeature.setStyle(null);
		});

		it('creates a kml with Document- and name-tag', () => {
			const features = [aPolygonFeature];
			const layer = createLayerMock(features);

			const actual = create(layer, projection);

			const containsDocumentTag = actual.includes('<Document>') && actual.includes('</Document>');
			const containsNameTag = actual.includes('<name>Foo</name>');
			expect(containsDocumentTag).toBeTrue();
			expect(containsNameTag).toBeTrue();
		});

		it('creates a kml with Document-tag only', () => {
			const features = [aPolygonFeature];
			const layer = createLayerMock(features, false);

			const actual = create(layer, projection);

			const containsDocumentTag = actual.includes('<Document>') && actual.includes('</Document>');
			const containsNameTag = actual.includes('<name>Foo</name>');
			expect(containsDocumentTag).toBeTrue();
			expect(containsNameTag).toBeFalse();
		});

		it('creates a kml with 2 feature', () => {
			const features = [aPolygonFeature, aPointFeature];
			const layer = createLayerMock(features);

			const actual = create(layer, projection);

			const containsPolygonFeature = actual.includes('<Placemark><Polygon>');
			const containsPointFeature = actual.includes('<Placemark><Point>');
			expect(containsPolygonFeature).toBeTrue();
			expect(containsPointFeature).toBeTrue();
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
			aPolygonFeature.setStyle(getAStyleFunction());
			const features = [aPolygonFeature];
			const layer = createLayerMock(features);

			const actual = create(layer, projection);

			const containsLineStyle = actual.includes('LineStyle') && actual.includes('<color>ffcc9933</color>');
			const containsPolyStyle = actual.includes('PolyStyle') && actual.includes('<color>66ffffff</color>');
			expect(containsLineStyle).toBeTrue();
			expect(containsPolyStyle).toBeTrue();
		});

		it('overrides existing name-attribute of feature for text-style', () => {
			const feature = aPointFeature.clone();
			feature.set('name', 'Bar');

			feature.setStyle(getATextStyleFunction());
			const features = [feature];

			const layer = createLayerMock(features);

			const actual = create(layer, projection);
			const containsTextStyle = actual.includes('IconStyle') && actual.includes('<Placemark><name>Foo</name>');
			expect(containsTextStyle).toBeTrue();
		});

		it('reads and converts style-properties from layer', () => {

			const features = [aPolygonFeature];
			const layer = createLayerMock(features);
			layer.getStyleFunction = getAStyleFunction;

			const actual = create(layer, projection);

			const containsLineStyle = actual.includes('LineStyle') && actual.includes('<color>ffcc9933</color>');
			const containsPolyStyle = actual.includes('PolyStyle') && actual.includes('<color>66ffffff</color>');
			expect(containsLineStyle).toBeTrue();
			expect(containsPolyStyle).toBeTrue();
		});

		it('reads and converts text style-properties from feature', () => {
			aPointFeature.setStyle(getATextStyleFunction());
			const features = [aPointFeature];
			const layer = createLayerMock(features);

			const actual = create(layer, projection);

			const containsIconStyle = actual.includes('<IconStyle>');
			const containsDummyIcon = actual.includes('<Icon><href>noimage</href></Icon>');
			expect(containsIconStyle).toBeTrue();
			expect(containsDummyIcon).toBeFalse();
		});

		it('reads and converts icon style-properties from feature', () => {
			const color = [255, 42, 42];
			const iconSrc = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgY2xhc3M9ImJpIGJpLWdlby1hbHQtZmlsbCIgdmlld0JveD0iMCAwIDE2IDE2Ij48IS0tIE1JVCBMaWNlbnNlIC0tPjxwYXRoIGQ9Ik04IDE2czYtNS42ODYgNi0xMEE2IDYgMCAwIDAgMiA2YzAgNC4zMTQgNiAxMCA2IDEwem0wLTdhMyAzIDAgMSAxIDAtNiAzIDMgMCAwIDEgMCA2eiIvPjwvc3ZnPg==';
			const expectedUrl = `backend.url/icon/${color}/${iconSrc.substr(iconSrc.length - 5)}`;
			aPointFeature.setStyle(getAIconStyleFunction(color, iconSrc));
			const features = [aPointFeature];
			const layer = createLayerMock(features);

			const actual = create(layer, projection);
			const containsIconStyle = actual.includes('<IconStyle>');
			const containsRemoteIcon = actual.includes(`<Icon><href>${expectedUrl}</href></Icon>`);
			expect(containsIconStyle).toBeTrue();
			expect(containsRemoteIcon).toBeTrue();
		});

		it('reads and converts none-style-properties from feature', () => {
			aPointFeature.setStyle(getANoneStyleFunction());
			const features = [aPointFeature];
			const layer = createLayerMock(features);

			const actual = create(layer, projection);

			const containsNoSpecificStyle = actual.includes('<Style/>');
			expect(containsNoSpecificStyle).toBeTrue();
		});

		it('reads a single style and converts style-properties from feature', () => {
			aPolygonFeature.setStyle(getASingleEmptyStyleFunction());
			const features = [aPolygonFeature];
			const layer = createLayerMock(features);

			const actual = create(layer, projection);
			const containsIconStyle = actual.includes('PolyStyle');
			expect(containsIconStyle).toBeTrue();
		});

		describe('when iconService fails to resolve icon to url', () => {
			it('should use svg icon style-properties ', () => {
				const color = [255, 42, 42];
				const iconSrc = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgY2xhc3M9ImJpIGJpLWdlby1hbHQtZmlsbCIgdmlld0JveD0iMCAwIDE2IDE2Ij48IS0tIE1JVCBMaWNlbnNlIC0tPjxwYXRoIGQ9Ik04IDE2czYtNS42ODYgNi0xMEE2IDYgMCAwIDAgMiA2YzAgNC4zMTQgNiAxMCA2IDEwem0wLTdhMyAzIDAgMSAxIDAtNiAzIDMgMCAwIDEgMCA2eiIvPjwvc3ZnPg==';
				const expectedUrl = `backend.url/icon/${color}/${iconSrc.substr(iconSrc.length - 5)}`;
				aPointFeature.setStyle(getAIconStyleFunction(color, iconSrc));
				spyOn(iconServiceMock, 'getIconResult').and.callFake(() => {
					return { getUrl: () => null };
				});
				const features = [aPointFeature];
				const layer = createLayerMock(features);

				const actual = create(layer, projection);
				const containsIconStyle = actual.includes('<IconStyle>');
				const containsRemoteIcon = actual.includes(`<Icon><href>${expectedUrl}</href></Icon>`);
				expect(containsIconStyle).toBeTrue();
				expect(containsRemoteIcon).toBeFalse();
			});
		});
	});

	describe('toKmlStyleProperties', () => {
		it('maps a missing style-component to null', () => {
			const nullStyleMock = {};

			const kmlStyleProperties = toKmlStyleProperties(nullStyleMock);

			expect(kmlStyleProperties.fill).toBeNull();
			expect(kmlStyleProperties.stroke).toBeNull();
			expect(kmlStyleProperties.text).toBeNull();
			expect(kmlStyleProperties.image).toBeNull();
			expect(kmlStyleProperties.zIndex).toBeNull();
		});
	});
});
