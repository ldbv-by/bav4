import { $injector } from '../../../injection';
import { provide } from './uiTheme.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('uiThemeProvider', provide);
