import { $injector } from '../../../injection/index';
import { provide as legendProvider } from './legend.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('legendProvider', legendProvider);
