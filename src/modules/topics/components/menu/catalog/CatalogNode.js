import { html, nothing } from 'lit-html';
import { BaElement } from '../../../../BaElement';
import css from './CatalogNode.css';

/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogNode extends BaElement {

	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.render();
	}



	createView() {

		if (this._catalogPart) {



			const { label, children } = this._catalogPart;

			// {
			// 	label: `Suptopic1 ${topicId}`,
			// 	children: [
			// 		{
			// 			geoResourceId: 'atkis'
			// 		},
			// 		{
			// 			geoResourceId: 'atkis_sw'
			// 		},
			// 		{
			// 			label: `Suptopic2 ${topicId}`,
			// 			children: [{
			// 				geoResourceId: 'atkis_sw'
			// 			}]
			// 		}
			// 	]
			// }

			const childElements = children.map(child => {
				//node
				if (child.children) {
					return html`<ba-catalog-node .data=${child}></ba-catalog-node>`;
				}
				//leaf
				return html`<ba-catalog-leaf .data=${child}></ba-catalog-leaf>`;
			});

			return html`
			<style>${css}</style>
			<div class="ba-list-item">
			<div class="ba-list-item__text">${label}</div>
			</div>

            <div>${childElements}</div>
        `;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-catalog-node';
	}
}
