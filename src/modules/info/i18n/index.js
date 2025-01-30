import { $injector } from '../../../injection';
import { provide as coordinateInfoProvider } from './coordinateInfo.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('coordinateInfoProvider', coordinateInfoProvider);
