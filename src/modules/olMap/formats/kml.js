/**
 * @module modules/olMap/formats/kml
 */
import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { KML } from 'ol/format';
import { $injector } from '../../../injection';
import { AssetSourceType, getAssetSource } from '../../../utils/assets';
import { asInternalProperty, EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS, LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS } from '../../../utils/propertyUtils';

export const KML_PROJECTION_LIKE = 'EPSG:4326';

export const KML_EMPTY_CONTENT =
	'<?xml version="1.0" encoding="UTF-8"?><kml xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.opengis.net/kml/2.2"><Document></Document></kml>';

const tryRectifyingLineString = (polygonCandidate) => {
	if (polygonCandidate instanceof Polygon && polygonCandidate.getCoordinates()[0].length === 3) {
		return new LineString(polygonCandidate.getCoordinates()[0]);
	}
	return polygonCandidate;
};

const replaceIcon = (old) => {
	const svgSrc = old.getSrc();
	const svgScale = old.getScale();
	const { IconService: iconService } = $injector.inject('IconService');
	const iconResult = iconService.getIconResult(svgSrc);

	// A nullish IconResult/IconUrl leads to a invalid KML (according to the specification).
	// Nevertheless some applications/frameworks can handle such a kml (icons with base64 image sources).
	// The application uses multicolored and multilayered svg icons, which we prevent to be replaced by the raster version
	const iconUrl = iconResult && iconResult.isMonochrome ? iconResult?.getUrl(old.getColor()) : null;

	const iconOptions = {
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: iconUrl,
		scale: svgScale
	};
	return iconUrl ? new Icon(iconOptions) : old;
};

export const toKmlStyleProperties = (style) => {
	return {
		fill: style.getFill ? style.getFill() : null,
		stroke: style.getStroke ? style.getStroke() : null,
		text: style.getText ? style.getText() : null,
		image: style.getImage ? style.getImage() : null,
		zIndex: style.getZIndex ? style.getZIndex() : null
	};
};

const sanitizeStyle = (styles) => {
	const getFirstOrDefault = (styles) => {
		const firstStyle = styles[0] ? styles[0] : styles && !Array.isArray(styles) ? styles : null;
		return firstStyle ?? new Style();
	};

	const style = getFirstOrDefault(styles);
	const kmlStyleProperties = toKmlStyleProperties(style);

	if (kmlStyleProperties.image instanceof CircleStyle) {
		kmlStyleProperties.image = null;
	}

	if (kmlStyleProperties.image instanceof Icon && getAssetSource(kmlStyleProperties.image.getSrc()) === AssetSourceType.LOCAL) {
		kmlStyleProperties.image = replaceIcon(kmlStyleProperties.image);
	}

	const isTextOnlyStyle = kmlStyleProperties.text && !kmlStyleProperties.image;

	if (isTextOnlyStyle) {
		if (kmlStyleProperties.text.getText() === '') {
			// text only style without text makes no sense
			return null;
		}
		kmlStyleProperties.image = new Icon({ src: 'noimage', scale: 0 });
	}
	return new Style(kmlStyleProperties);
};

/**
 * Creates a string containing the features of the specified layer in KML format.
 * This string includes the styles of the encoded features.
 *
 * Point-Features with a base64-ImageSource will be replaced by a defined static
 * remote resource (URL). If this remote resource is not defined in the list of
 * fallback icons in the IconService, the base64 ImageSource is used.
 *
 * A base64-ImageSource is not permitted according to the KML specification but is
 * sometimes supported by various applications.
 *
 * @param {ol.layer.Layer} layer the layer
 * @param {ol.proj.ProjectionLike} sourceProjection the projection of the features of the given layer
 * @returns {string} the kml content
 */
export const create = (layer, sourceProjection) => {
	const asKmlFeature = (olFeature, sourceProjection) => {
		const clone = olFeature.clone();
		clone.setId(olFeature.getId());
		clone.getGeometry().setProperties(olFeature.getGeometry().getProperties());
		clone.getGeometry().transform(sourceProjection, KML_PROJECTION_LIKE);

		if (clone.getGeometry().getType() === 'Polygon') {
			clone.setGeometry(tryRectifyingLineString(clone.getGeometry()));
		}
		const styles = clone.getStyleFunction() || layer.getStyleFunction();
		if (styles) {
			const kmlStyle = sanitizeStyle(styles(clone));
			if (!kmlStyle) {
				// the feature should not be exported, without any valid style
				return null;
			}

			// If a name property exists already alongside of a valid text style (with new label value),
			// the name property (old label value) have to be removed
			if (clone.getKeys().includes('name') && kmlStyle.getText()) {
				clone.unset('name');
			}
			clone.setStyle(kmlStyle);
		}

		// explicit check for NULL; if the feature does not have the 'description' property
		// the get-function resolves to UNDEFINED and the call of unset() is not needed
		if (clone.get('description') === null) {
			clone.unset('description');
		}

		// cleaning up all internal properties, which are not needed/valid outside the current session
		const exportableInternalProperties = new Set([...EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS]);
		const allInternalProperties = new Set([...LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS]);
		const notExportableInternalProperties = new Set(
			[...allInternalProperties].filter((p) => !exportableInternalProperties.has(p)).map((p) => asInternalProperty(p))
		);

		const removableProperties = new Set([...clone.getKeys()].filter((p) => notExportableInternalProperties.has(p)));
		removableProperties.forEach((p) => clone.unset(p));
		return clone;
	};

	const writeDocument = (kmlFeatures) => {
		let kmlString;
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
		return kmlString;
	};

	const kmlFeatures = layer
		.getSource()
		.getFeatures()
		.filter((f) => f.getGeometry().getType() !== 'Circle')
		.map((f) => asKmlFeature(f, sourceProjection))
		.filter(Boolean);

	return kmlFeatures.length > 0 ? writeDocument(kmlFeatures) : null;
};
