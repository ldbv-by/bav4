import { ContextMenueEventHandler } from '../components/olMap/handler/contextMenue/ContextMenueEventHandler';

export const mapModule = ($injector) => {
	$injector.register('OlContextMenueMapEventHandler', ContextMenueEventHandler);
};