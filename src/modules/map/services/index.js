import { ContextMenuEventHandler } from '../components/olMap/handler/contextMenu/ContextMenuEventHandler';

export const mapModule = ($injector) => {
	$injector.register('OlContextMenueMapEventHandler', ContextMenuEventHandler);
};