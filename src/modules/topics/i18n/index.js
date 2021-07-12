import { provide as topicsProvider } from './topics.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('topicsProvider', topicsProvider);
