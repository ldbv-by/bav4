import { OlMeasurementHandler } from '../components/olMap/handler/measure/OlMeasurementHandler';
import { OlGeolocationHandler } from '../components/olMap/handler/geolocation/OlGeolocationHandler';
import { GeolocationPlugin } from '../store/GeolocationPlugin';
import { MeasurementPlugin } from '../store/MeasurementPlugin';
import { ContextClickPlugin } from '../store/ContextClickPlugin';

export const mapModule = ($injector) => {
	$injector
		.registerSingleton('MeasurementPlugin', new MeasurementPlugin())
		.registerSingleton('GeolocationPlugin', new GeolocationPlugin())
		.registerSingleton('ContextClickPlugin', new ContextClickPlugin())
		.register('OlMeasurementHandler', OlMeasurementHandler)
		.register('OlGeolocationHandler', OlGeolocationHandler);
};