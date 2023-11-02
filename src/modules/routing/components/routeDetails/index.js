import { RouteDetails } from './RouteDetails';
import { RouteWarnings } from './RouteWarnings';

if (!window.customElements.get(RouteDetails.tag)) {
	window.customElements.define(RouteDetails.tag, RouteDetails);
}

if (!window.customElements.get(RouteWarnings.tag)) {
	window.customElements.define(RouteWarnings.tag, RouteWarnings);
}
// Note: RouteChart is omitted here, because the component will be provided by its own chunk (see .src/chunks/route-chart.js)
