import { OlContextMenuEventHandler } from '../components/olMap/handler/contextMenu/OlContextMenuEventHandler';
import { OlMeasurementHandler } from '../components/olMap/handler/measure/OlMeasurementHandler';

export const mapModule = ($injector) => {
	$injector
		.register('OlContextMenueMapEventHandler', OlContextMenuEventHandler)
		.register('OlMeasurementHandler', OlMeasurementHandler);
};