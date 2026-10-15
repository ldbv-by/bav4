import { OlDrawHandler } from '../handler/draw/OlDrawHandler';
import { OlElevationProfileHandler } from '../handler/elevationProfile/OlElevationProfileHandler';
import { OlFeatureInfoHandler } from '../handler/featureInfo/OlFeatureInfoHandler';
import { OlGeolocationHandler } from '../handler/geolocation/OlGeolocationHandler';
import { OlHighlightLayerHandler } from '../handler/highlight/OlHighlightLayerHandler';
import { OlLayerSwipeHandler } from '../handler/layerSwipe/OlLayerSwipeHandler';
import { OlMeasurementHandler } from '../handler/measure/OlMeasurementHandler';
import { OlOverlayMapHandler } from '../handler/measure/OlOverlayMapHandler';
import { OlMfpHandler } from '../handler/mfp/OlMfpHandler';
import { OlRoutingHandler } from '../handler/routing/OlRoutingHandler';
import { OlSelectableFeatureHandler } from '../handler/selectableFeature/OlSelectableFeatureHandler';
import { LayerService } from '../services/LayerService';
import { OlStyleService } from '../services/OlStyleService';
import { OverlayService } from '../services/OverlayService';
import { RtVectorLayerService } from '../services/RtVectorLayerService';
import { VectorLayerService } from '../services/VectorLayerService';
import { VtLayerRenderingService } from '../services/VtLayerRenderingService';

export const olModule = ($injector) => {
	$injector
		.registerSingleton('StyleService', new OlStyleService())
		.register('OlMeasurementHandler', OlMeasurementHandler)
		.register('OlDrawHandler', OlDrawHandler)
		.register('OlGeolocationHandler', OlGeolocationHandler)
		.register('OlHighlightLayerHandler', OlHighlightLayerHandler)
		.register('VectorLayerService', VectorLayerService)
		.register('RtVectorLayerService', RtVectorLayerService)
		.register('VtLayerRenderingService', VtLayerRenderingService)
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
