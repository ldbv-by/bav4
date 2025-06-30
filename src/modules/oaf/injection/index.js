import { OafMaskParserService } from '../services/OafMaskParserService';

export const oafModule = ($injector) => {
	$injector.register('OafMaskParserService', OafMaskParserService);
};
