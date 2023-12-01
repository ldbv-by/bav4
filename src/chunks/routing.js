/**
 * This file just defines all dependencies for the chunk "routing"
 */
import '../modules/routing/i18n';
import { RoutingContainer } from '../modules/routing/components/routingContainer/routingContainer';
import { CategoryBar } from '../modules/routing/components/categoryBar/CategoryBar';
import { FeedbackBanner } from '../modules/routing/components/feedbackBanner/FeedbackBanner';
import { RouteInfo } from '../modules/routing/components/routeInfo/RouteInfo';
import { Waypoints } from '../modules/routing/components/waypoints/Waypoints';
import { WaypointItem } from '../modules/routing/components/waypoints/WaypointItem';
import '../modules/routing/components/routeDetails';

import { provide as routingProvider } from '../modules/routing/i18n/routing.provider';
import { $injector } from '../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('routingProvider', routingProvider);

if (!window.customElements.get(RoutingContainer.tag)) {
	window.customElements.define(RoutingContainer.tag, RoutingContainer);
}
if (!window.customElements.get(CategoryBar.tag)) {
	window.customElements.define(CategoryBar.tag, CategoryBar);
}
if (!window.customElements.get(FeedbackBanner.tag)) {
	window.customElements.define(FeedbackBanner.tag, FeedbackBanner);
}
if (!window.customElements.get(RouteInfo.tag)) {
	window.customElements.define(RouteInfo.tag, RouteInfo);
}
if (!window.customElements.get(Waypoints.tag)) {
	window.customElements.define(Waypoints.tag, Waypoints);
}
if (!window.customElements.get(WaypointItem.tag)) {
	window.customElements.define(WaypointItem.tag, WaypointItem);
}
