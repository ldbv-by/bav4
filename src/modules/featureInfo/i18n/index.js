import { provide } from './featureInfo.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('featureInfoProvider', provide);
