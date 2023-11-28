import './i18n';
import { RoutingChip } from './components/assistChip/RoutingChip';
import { ProposalContextContent } from './components/contextMenu/ProposalContextContent';

if (!window.customElements.get(RoutingChip.tag)) {
	window.customElements.define(RoutingChip.tag, RoutingChip);
}

if (!window.customElements.get(ProposalContextContent.tag)) {
	window.customElements.define(ProposalContextContent.tag, ProposalContextContent);
}
// Note: routing components are omitted here (excluding the routing chip), because the components will be provided by its own chunk (see .src/chunks/routing.js)
