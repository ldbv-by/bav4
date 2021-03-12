import { LayersObserver } from '../store/LayersObserver';
import { PositionObserver } from '../store/PositionObserver';
import { OlContextMenuEventHandler } from '../components/olMap/handler/contextMenu/OlContextMenuEventHandler';
import { OlMeasurementHandler } from '../components/olMap/handler/measure/OlMeasurementHandler';
import { OlGeolocationHandler } from '../components/olMap/handler/geolocation/OlGeolocationHandler';
import { GeolocationObserver } from '../store/GeolocationObserver';

export const mapModule = ($injector) => {
	$injector
		.registerSingleton('GeolocationObserver', new GeolocationObserver())
		.registerSingleton('LayersObserver', new LayersObserver())
		.registerSingleton('PositionObserver', new PositionObserver())
		.register('OlContextMenueMapEventHandler', OlContextMenuEventHandler)
		.register('OlMeasurementHandler', OlMeasurementHandler)
		.register('OlGeolocationHandler', OlGeolocationHandler);
};