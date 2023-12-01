/**
 * @module modules/featureInfo/components/featureInfoIframePanel/FeatureInfoIframePanel
 */
import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../../injection';
import { abortOrReset } from '../../../../store/featureInfo/featureInfo.action';
import css from './featureInfoIframePanel.css';
import arrowLeftShortIcon from '../assets/arrowLeftShort.svg';
import {
	addHighlightFeatures,
	HighlightFeatureType,
	HighlightGeometryType,
	removeHighlightFeaturesById
} from '../../../../store/highlight/highlight.action';
import { createUniqueId } from '../../../../utils/numberUtils';
import { isTemplateResult } from '../../../../utils/checks';
import { MvuElement } from '../../../MvuElement';

const Update_FeatureInfo_Data = 'update_featureInfo_data';
export const TEMPORARY_FEATURE_HIGHLIGHT_ID = `highlightedFeatureInfoGeometry_${createUniqueId()}`;

/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class FeatureInfoIframePanel extends MvuElement {
	constructor() {
		super({
			featureInfoData: []
		});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;

		this.observe(
			(store) => store.featureInfo.current,
			(current) => this.signal(Update_FeatureInfo_Data, [...current])
		);
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

		const getContent = (content) => {
			return isTemplateResult(content) ? content : html`${unsafeHTML(content)}`;
		};

		/**
		 * Uses mouseenter and mouseleave events for adding/removing a temporary highlight feature.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (featureInfoGeometry) => {
			if (featureInfoGeometry) {
				addHighlightFeatures({
					id: TEMPORARY_FEATURE_HIGHLIGHT_ID,
					type: HighlightFeatureType.MARKER_TMP,
					data: { geometry: featureInfoGeometry.data, geometryType: HighlightGeometryType.GEOJSON }
				});
			}
		};
		const onMouseLeave = () => {
			removeHighlightFeaturesById(TEMPORARY_FEATURE_HIGHLIGHT_ID);
		};

		const getGeometryClass = (featureInfoGeometry) => {
			return featureInfoGeometry ? 'is-geometry' : '';
		};

		return html`
			<style>
				${css}
			</style>
			<div>
				<div class="container">
					<ul class="ba-list">
						<li class="ba-list-item  ba-list-inline ba-list-item__header featureinfo-header">
							<span class="ba-list-item__pre" style="position:relative;left:-1em;">
								<ba-icon .icon="${arrowLeftShortIcon}" .size=${4} .title=${translate('featureInfo_close_button')} @click=${abortOrReset}></ba-icon>
							</span>
							<span class="ba-list-item__text vertical-center">
								<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> ${translate('featureInfo_header')} </span>
							</span>
						</li>
						${featureInfoData.map(
							(item) => html`
								<li class="ba-section">
									<button
										class="ba-list-item ba-list-item__header ${getGeometryClass(item.geometry)}"
										@mouseenter=${() => onMouseEnter(item.geometry)}
										@mouseleave=${() => onMouseLeave(item.geometry)}
									>
										<span class="ba-list-item__text  ba-list-item__primary-text">${item.title}</span>
										<span class="ba-list-item__after">
											<i class="icon icon-rotate-90 chevron iconexpand"></i>
										</span>
									</button>
									<div class="collapse-content divider">${getContent(item.content)}</div>
								</li>
							`
						)}
					</ul>
					<div></div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-feature-info-iframe-panel';
	}
}
