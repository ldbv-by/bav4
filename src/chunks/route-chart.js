/**
 * This file just defines all dependencies for the chunk "route-chart"
 */
import { RouteChart } from '../modules/routing/components/routeDetails/RouteChart';

if (!window.customElements.get(RouteChart.tag)) {
	window.customElements.define(RouteChart.tag, RouteChart);
}
