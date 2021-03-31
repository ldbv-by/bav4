import { LayersObserver } from '../store/LayersObserver';
import { PositionObserver } from '../store/PositionObserver';
import { OlMeasurementHandler } from '../components/olMap/handler/measure/OlMeasurementHandler';
import { OlGeolocationHandler } from '../components/olMap/handler/geolocation/OlGeolocationHandler';
import { GeolocationObserver } from '../store/GeolocationObserver';
import { MeasurementObserver } from '../store/MeasurementObserver';
import { ContextClickPlugin } from '../store/ContextClickPlugin';

export const mapModule = ($injector) => {
	$injector
		.registerSingleton('MeasurementObserver', new MeasurementObserver())
		.registerSingleton('GeolocationObserver', new GeolocationObserver())
		.registerSingleton('LayersObserver', new LayersObserver())
		.registerSingleton('PositionObserver', new PositionObserver())
		.registerSingleton('ContextClickPlugin', new ContextClickPlugin())
		.register('OlMeasurementHandler', OlMeasurementHandler)
		.register('OlGeolocationHandler', OlGeolocationHandler);
};