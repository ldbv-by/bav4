import { OlMeasurementHandler } from '../handler/measure/OlMeasurementHandler';
import { OlGeolocationHandler } from '../handler/geolocation/OlGeolocationHandler';
import { OlHighlightLayerHandler } from '../handler/highlight/OlHighlightLayerHandler';
import { VectorLayerService } from '../services/VectorLayerService';
import { LayerService } from '../services/LayerService';
import { StyleService } from '../services/StyleService';
import { OverlayService } from '../services/OverlayService';
import { OlDrawHandler } from '../handler/draw/OlDrawHandler';
import { InteractionStorageService } from '../services/InteractionStorageService';
import { OlFeatureInfoHandler } from '../handler/featureInfo/OlFeatureInfoHandler';
import { OlMfpHandler } from '../handler/mfp/OlMfpHandler';

export const mapModule = ($injector) => {
	$injector
		.registerSingleton('StyleService', new StyleService())
		.register('OlMeasurementHandler', OlMeasurementHandler)
		.register('OlDrawHandler', OlDrawHandler)
		.register('OlGeolocationHandler', OlGeolocationHandler)
		.register('OlHighlightLayerHandler', OlHighlightLayerHandler)
		.register('VectorLayerService', VectorLayerService)
		.register('LayerService', LayerService)
		.register('InteractionStorageService', InteractionStorageService)
		.register('OverlayService', OverlayService)
		.register('OlFeatureInfoHandler', OlFeatureInfoHandler)
		.register('OlMfpHandler', OlMfpHandler);
};
