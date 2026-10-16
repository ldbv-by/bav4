import { $injector } from '../../../injection';
import { provide } from './legends.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('legendsProvider', provide);
