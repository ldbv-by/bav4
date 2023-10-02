import { RouteDetails } from './RouteDetails';
import { RoutingChart } from './RoutingChart';
import { RoutingWarnings } from './RoutingWarnings';

if (!window.customElements.get(RouteDetails.tag)) {
	window.customElements.define(RouteDetails.tag, RouteDetails);
}

if (!window.customElements.get(RoutingChart.tag)) {
	window.customElements.define(RoutingChart.tag, RoutingChart);
}

if (!window.customElements.get(RoutingWarnings.tag)) {
	window.customElements.define(RoutingWarnings.tag, RoutingWarnings);
}
