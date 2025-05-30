import { OlMeasurementHandler } from '../handler/measure/OlMeasurementHandler';
import { OlGeolocationHandler } from '../handler/geolocation/OlGeolocationHandler';
import { OlHighlightLayerHandler } from '../handler/highlight/OlHighlightLayerHandler';
import { VectorLayerService } from '../services/VectorLayerService';
import { LayerService } from '../services/LayerService';
import { OverlayService } from '../services/OverlayService';
import { OlDrawHandler } from '../handler/draw/OlDrawHandler';
import { OlFeatureInfoHandler } from '../handler/featureInfo/OlFeatureInfoHandler';
import { OlMfpHandler } from '../handler/mfp/OlMfpHandler';
import { OlElevationProfileHandler } from '../handler/elevationProfile/OlElevationProfileHandler';
import { OlRoutingHandler } from '../handler/routing/OlRoutingHandler';
import { OlSelectableFeatureHandler } from '../handler/selectableFeature/OlSelectableFeatureHandler';
import { RtVectorLayerService } from '../services/RtVectorLayerService';
import { OlOverlayMapHandler } from '../handler/measure/OlOverlayMapHandler';
import { OlLayerSwipeHandler } from '../handler/layerSwipe/OlLayerSwipeHandler';
import { OlStyleService } from '../services/OlStyleService';

export const mapModule = ($injector) => {
	$injector
		.registerSingleton('StyleService', new OlStyleService())
		.register('OlMeasurementHandler', OlMeasurementHandler)
		.register('OlDrawHandler', OlDrawHandler)
		.register('OlGeolocationHandler', OlGeolocationHandler)
		.register('OlHighlightLayerHandler', OlHighlightLayerHandler)
		.register('VectorLayerService', VectorLayerService)
		.register('RtVectorLayerService', RtVectorLayerService)
		.register('LayerService', LayerService)
		.register('OverlayService', OverlayService)
		.register('OlFeatureInfoHandler', OlFeatureInfoHandler)
		.register('OlElevationProfileHandler', OlElevationProfileHandler)
		.register('OlOverlayMapHandler', OlOverlayMapHandler)
		.register('OlMfpHandler', OlMfpHandler)
		.register('OlRoutingHandler', OlRoutingHandler)
		.register('OlSelectableFeatureHandler', OlSelectableFeatureHandler)
		.register('OlLayerSwipeHandler', OlLayerSwipeHandler);
};
