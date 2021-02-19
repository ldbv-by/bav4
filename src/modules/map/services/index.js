import { ContextMenuEventHandler } from '../components/olMap/handler/contextMenu/ContextMenuEventHandler';
import { OlMeasurementHandler } from '../components/olMap/handler/measure/OlMeasurementHandler';

export const mapModule = ($injector) => {
	$injector
		.register('OlContextMenueMapEventHandler', ContextMenuEventHandler)
		.register('OlMeasurementHandler', OlMeasurementHandler);
};