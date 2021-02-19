import { OlContextMenuEventHandler } from '../components/olMap/handler/contextMenu/OlContextMenuEventHandler';

export const mapModule = ($injector) => {
	$injector.register('OlContextMenueMapEventHandler', OlContextMenuEventHandler);
};