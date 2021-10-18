import { html, TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { $injector } from '../../../injection';
import { clear } from '../../../store/featureInfo/featureInfo.action';
import { AbstractMvuContentPanel } from '../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import css from './featureInfoPanel.css';

const Update_FeatureInfo_Data = 'update_featureInfo_data';

/**
 * @class
 * @author taulinger
 */
export class FeatureInfoPanel extends AbstractMvuContentPanel {

	constructor() {
		super({
			featureInfoData: []
		});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;

		this.observe(store => store.featureInfo.current, current => this.signal(Update_FeatureInfo_Data, [...current]));
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_FeatureInfo_Data:
				return { ...model, featureInfoData: [...data] };
		}
	}

	/**
	 *@override
	 */
	createView(model) {

		const { featureInfoData } = model;
		const translate = (key) => this._translationService.translate(key);

		const getContent = content => {
			return content instanceof TemplateResult ? content : html`${unsafeHTML(content)}`;
		};

		return html`
        <style>${css}</style>
		<div>
			<ba-icon .title=${translate('featureInfo_close_button')} .type=${'primary'} @click=${clear}></ba-icon>
			<div class="container">
			${featureInfoData.map((item) => html`
			<li class="item"><h3>${item.title}</h3>
			${getContent(item.content)}
			</li>`)}
			<div>
		</div>
        `;
	}

	static get tag() {
		return 'ba-feature-info-panel';
	}
}
