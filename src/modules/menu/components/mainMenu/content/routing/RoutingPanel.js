/**
 * @module modules/menu/components/mainMenu/content/routing/RoutingPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './routingPanel.css';
import { $injector } from '../../../../../../injection';
import { setTab } from '../../../../../../store/mainMenu/mainMenu.action';
import { TabIds } from '../../../../../../domain/mainMenu';
import svg from './assets/arrowLeftShort.svg';
import { setCategory, setRouteStats, setStatus, setWaypoints } from '../../../../../../store/routing/routing.action';
import { RoutingStatusCodes } from '../../../../../../domain/routing';

/**
 * Container for routing contents.
 * @class
 * @author alsturm
 * @author thiloSchlemmer
 */
export class RoutingPanel extends AbstractMvuContentPanel {
	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);
		//temp close
		const close = () => {
			setTab(TabIds.MAPS);
		};

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<ul class="ba-list">
					<li class="ba-list-item  ba-list-inline ba-list-item__header featureinfo-header">
						<span class="ba-list-item__pre" style="position:relative;left:-1em;">
							<ba-icon .icon="${svg}" .size=${4} .title=${translate('menu_misc_content_panel_routing_title')} @click=${close}></ba-icon>
						</span>
						<span class="ba-list-item__text vertical-center">
							<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> Routing </span>
						</span>
					</li>
				</ul>
				<div>				
				<ba-routing-feedback></ba-routing-feedback>
				<div class='chips-container>
					<!-- todo:: placing chips 'export' and 'share' here-->
				</div>
				
				<ba-routing-category-bar ></ba-routing-category-bar>
				<ba-routing-waypoints></ba-routing-waypoints>
				<ba-routing-info></ba-routing-info>
				<ba-routing-details></ba-routing-details></div>
				<div class="chips__container">
					<div>
						TODO chips
					</div>
				</div>
				${this._getDemoContent()} 
			</div>
		`;
	}

	/**
	 * for development use only
	 * @returns {import('../../../../../../../node_modules/lit-html/lit-html').TemplateResult}
	 */
	_getDemoContent() {
		const onClickLoadRoutingData1 = () => {
			setCategory('bvv-bike');
			setStatus(RoutingStatusCodes.Start_Destination_Missing);
			setRouteStats(null);
			setWaypoints([]);
		};

		const onClickLoadRoutingData2 = () => {
			setCategory('bvv-bike');
			setRouteStats({ time: 3600000, dist: 333, twoDiff: [111, 222] });
			setWaypoints([
				[1328315.0062647895, 6089975.78297438],
				[1310581.6157026286, 6045336.558455837],
				[1310381.715706286, 6045436.855837]
			]);
		};

		const onClickLoadRoutingData3 = () => {
			setCategory('bvv-bike');
			setRouteStats({
				time: 3600000,
				dist: 333,
				twoDiff: [111, 222],
				details: {
					surface: {
						asphalt: {
							distance: 18,
							segments: [
								[0, 1],
								[3, 4]
							]
						},
						other: {
							distance: 57,
							segments: [
								[0, 1],
								[3, 4]
							]
						}
					},
					road_class: {
						residential: 10
					},
					warnings: {
						hike_path_grade4_ground: {
							message: 'Alpine Erfahrung, Trittsicherheit erforderlich.',
							criticality: 'Warning',
							segments: [[0, 1]]
						},
						hike_path_grade5_ground: {
							message: 'Spezielle Ausrüstung erforderlich.',
							criticality: 'Warning',
							segments: [[0, 1]]
						}
					}
				}
			});
			setWaypoints([
				[1328315.0062647895, 6089975.78297438],
				[1310581.6157026286, 6045336.558455837],
				[1310381.715706286, 6045436.855837]
			]);
		};

		return html`<div class="demo">
			<div class="demo_title">Demo</div>
			<div class="demo_buttons">
				<ba-button id="button1" .label=${'Load routing data (Empty)'} .type=${'primary'} @click=${onClickLoadRoutingData1}></ba-button>
				<ba-button id="button2" .label=${'Load routing data (Version 2)'} .type=${'primary'} @click=${onClickLoadRoutingData2}></ba-button>
				<ba-button id="button3" .label=${'Load routing data (Version 3)'} .type=${'primary'} @click=${onClickLoadRoutingData3}></ba-button>
			</div>
		</div>`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
