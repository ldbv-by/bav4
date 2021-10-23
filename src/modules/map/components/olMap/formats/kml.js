import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { KML } from 'ol/format';

export const KML_PROJECTION_LIKE = 'EPSG:4326';

const tryRectifyingLineString = (polygonCandidate) => {
	if (polygonCandidate instanceof Polygon && polygonCandidate.getCoordinates()[0].length === 3) {
		return new LineString(polygonCandidate.getCoordinates()[0]);
	}
	return polygonCandidate;
};

const sanitizeStyle = (styles) => {
	const style = styles[0] ? styles[0] : styles;

	const kmlStyleProperties = {
		fill: style.getFill ? style.getFill() : null,
		stroke: style.getStroke ? style.getStroke() : null,
		text: style.getText ? style.getText() : null,
		image: style.getImage ? style.getImage() : null,
		zIndex: style.getZIndex ? style.getZIndex() : null
	};

	if (kmlStyleProperties.image instanceof CircleStyle) {
		kmlStyleProperties.image = null;
	}

	const isTextOnlyStyle = kmlStyleProperties.text && !kmlStyleProperties.image;
	if (isTextOnlyStyle) {
		kmlStyleProperties.image = new Icon({ src: 'noimage', scale: 0 });
	}

	return new Style(kmlStyleProperties);
};

export const create = (layer, projection) => {
	let kmlString;
	const kmlFeatures = [];
	layer.getSource().getFeatures()
		.filter(f => f.getGeometry().getType() !== 'Circle')
		.forEach(f => {
			const clone = f.clone();
			clone.setId(f.getId());
			clone.getGeometry().setProperties(f.getGeometry().getProperties());
			clone.getGeometry().transform(projection, KML_PROJECTION_LIKE);

			if (clone.getGeometry().getType() === 'Polygon') {
				clone.setGeometry(tryRectifyingLineString(clone.getGeometry()));
			}

			let styles = clone.getStyleFunction() || layer.getStyleFunction();
			if (styles) {
				styles = styles(clone);
				const kmlStyle = sanitizeStyle(styles);
				clone.setStyle(kmlStyle);
			}

			kmlFeatures.push(clone);
		});

	if (kmlFeatures.length > 0) {
		if (kmlFeatures.length === 1) {
			kmlFeatures.push(new Feature());
		}
		const format = new KML({ writeStyles: true });
		const options = { decimals: 8 };
		kmlString = format.writeFeatures(kmlFeatures, options);

		const removeNoImagePlaceHolder = (kmlString) => kmlString.replace(/<Icon>\s*<href>noimage<\/href>\s*<\/Icon>/g, '');
		const removeEmptyPlacemark = (kmlString) => kmlString.replace(/<Placemark\/>/g, '');

		kmlString = removeEmptyPlacemark(removeNoImagePlaceHolder(kmlString));

		if (layer.label) {
			kmlString = kmlString.replace(/<Document>/, '<Document><name>' + layer.label + '</name>');
		}

	}
	return kmlString;

};

export const readFeatures = (kmlString) => {
	const format = new KML({ writeStyles: true });
	return format.readFeatures(kmlString);
};
