import { provide as devInfoProvider } from './devInfo.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('devInfoProvider', devInfoProvider);
