import { RoutingChip } from './components/assistChip/RoutingChip';

if (!window.customElements.get(RoutingChip.tag)) {
	window.customElements.define(RoutingChip.tag, RoutingChip);
}
// Note: routing components are omitted here (excluding the routing chip), because the components will be provided by its own chunk (see .src/chunks/routing.js)
