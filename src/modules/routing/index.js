import './i18n';
import { ProposalContextContent } from './components/contextMenu/ProposalContextContent';

if (!window.customElements.get(ProposalContextContent.tag)) {
	window.customElements.define(ProposalContextContent.tag, ProposalContextContent);
}
// Note: routing components are omitted here (excluding the ProposalContextContent component), because the components will be provided by its own chunk (see .src/chunks/routing.js)
