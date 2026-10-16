import { $injector } from '../../../injection';
import { provide as devInfoProvider } from './devInfo.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('devInfoProvider', devInfoProvider);
