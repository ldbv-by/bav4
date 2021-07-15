import { OlMeasurementHandler } from '../components/olMap/handler/measure/OlMeasurementHandler';
import { OlGeolocationHandler } from '../components/olMap/handler/geolocation/OlGeolocationHandler';
import { OlHighlightLayerHandler } from '../components/olMap/handler/highlight/OlHighlightLayerHandler';
import { GeolocationPlugin } from '../store/GeolocationPlugin';
import { MeasurementPlugin } from '../store/MeasurementPlugin';
import { ContextClickPlugin } from '../store/ContextClickPlugin';
import { VectorImportService } from '../components/olMap/services/VectorImportService';
import { LayerService } from '../components/olMap/services/LayerService';
import { StyleService } from '../components/olMap/services/StyleService';
import { OverlayService } from '../components/olMap/services/OverlayService';
import { DrawPlugin } from '../store/DrawPlugin';
import { OlDrawHandler } from '../components/olMap/handler/draw/OlDrawHandler';

export const mapModule = ($injector) => {
	$injector
		.registerSingleton('MeasurementPlugin', new MeasurementPlugin())
		.registerSingleton('DrawPlugin', new DrawPlugin())
		.registerSingleton('GeolocationPlugin', new GeolocationPlugin())
		.registerSingleton('ContextClickPlugin', new ContextClickPlugin())
		.register('OlMeasurementHandler', OlMeasurementHandler)
		.register('OlDrawHandler', OlDrawHandler)
		.register('OlGeolocationHandler', OlGeolocationHandler)
		.register('OlHighlightLayerHandler', OlHighlightLayerHandler)
		.register('VectorImportService', VectorImportService)
		.register('LayerService', LayerService)
		.register('StyleService', StyleService)
		.register('OverlayService', OverlayService);
};