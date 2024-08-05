/**
 * @module modules/chips/components/assistChips/TimeTravelChip
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { AbstractAssistChip } from './AbstractAssistChip';
import timeSvg from './assets/time.svg';
import { openBottomSheet } from '../../../../store/bottomSheet/bottomSheet.action';

/**
 * An AssistChip to open the elevation profile, optionally for an array of {@link module:domain/coordinateTypeDef~Coordinate}
 * @class
 * @extends {AbstractAssistChip}
 * @property {Array<module:domain/coordinateTypeDef~CoordinateLike>} coordinates the coordinates array, which defines the route of the requested elevation profile
 * @author thiloSchlemmer
 */
export class TimeTravelChip extends AbstractAssistChip {
	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService', 'ElevationService');
		this._translationService = TranslationService;
	}

	getIcon() {
		return timeSvg;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_timeline');
	}

	isVisible() {
		return true;
	}

	onClick() {
		const getContent = () => {
			return html`
            </div>
                <ba-time-travel></ba-time-travel>
            <div>
            `;
		};

		openBottomSheet(getContent());
	}

	static get tag() {
		return 'ba-timeline-chip';
	}
}
