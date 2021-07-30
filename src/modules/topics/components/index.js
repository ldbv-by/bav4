import { TopicsContentPanel } from './menu/TopicsContentPanel';
import { CatalogContentPanel } from './menu/catalog/CatalogContentPanel';
import { CatalogNode } from './menu/catalog/CatalogNode';
import { CatalogLeaf } from './menu/catalog/CatalogLeaf';
if (!window.customElements.get(TopicsContentPanel.tag)) {
	window.customElements.define(TopicsContentPanel.tag, TopicsContentPanel);
}
if (!window.customElements.get(CatalogContentPanel.tag)) {
	window.customElements.define(CatalogContentPanel.tag, CatalogContentPanel);
}
if (!window.customElements.get(CatalogNode.tag)) {
	window.customElements.define(CatalogNode.tag, CatalogNode);
}
if (!window.customElements.get(CatalogLeaf.tag)) {
	window.customElements.define(CatalogLeaf.tag, CatalogLeaf);
}
