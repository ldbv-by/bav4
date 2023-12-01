import { RouteDetails } from './RouteDetails';
import { RouteWarnings } from './RouteWarnings';
import { RouteChart } from './RouteChart';

if (!window.customElements.get(RouteDetails.tag)) {
	window.customElements.define(RouteDetails.tag, RouteDetails);
}

if (!window.customElements.get(RouteWarnings.tag)) {
	window.customElements.define(RouteWarnings.tag, RouteWarnings);
}

if (!window.customElements.get(RouteChart.tag)) {
	window.customElements.define(RouteChart.tag, RouteChart);
}
