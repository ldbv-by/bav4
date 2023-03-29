import { $injector } from '../../../../injection';
import { reset, setType } from '../../../../store/draw/draw.action';
import { MvuElement } from '../../../MvuElement';

const Update_Tools = 'update_tools';

export class DrawTool extends MvuElement {
	constructor() {
		super({
			type: null,
			style: null,
			mode: null,
			validGeometry: null,
			tools: null
		});

		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			SecurityService: securityService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'SecurityService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._securityService = securityService;
		this.signal(Update_Tools, this._buildTools());
	}

	update(type, data, model) {
		switch (type) {
			case Update_Tools:
				return { ...model, tools: data };
		}
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);
		return [
			{
				id: 1,
				name: 'marker',
				active: false,
				title: translate('toolbox_drawTool_symbol'),
				icon: 'symbol',
				activate: () => {
					reset();
					// clearText();
					// clearDescription();
					setType('marker');
				}
			},
			{
				id: 3,
				name: 'line',
				active: false,
				title: translate('toolbox_drawTool_line'),
				icon: 'line',
				activate: () => {
					reset();
					// clearText();
					// clearDescription();
					setType('line');
				}
			}
		];
	}
}
