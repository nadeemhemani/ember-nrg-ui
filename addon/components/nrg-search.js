import { action, get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import NrgValidationComponent from './nrg-validation-component';

const defaultPlaceholder = 'Search';
const defaultMinCharacters = 1;
const defaultSearchTimeout = 300;
const defaultDisplayLabel = 'header';
const defaultNoResultsLabel = 'No Results';

export default class NrgSearchComponent extends NrgValidationComponent {
  @tracked
  isFocused = false;

  @tracked
  activeItem = -1;

  @tracked
  searchString = '';

  @tracked
  items = null;

  constructor() {
    super(...arguments);
    this.updateDisplayValue(this.value);
  }

  get fluid() {
    return this.args.fluid !== false;
  }

  get searchTimeout() {
    return this.args.searchTimeout ?? defaultSearchTimeout;
  }

  get minCharacters() {
    return this.args.minCharacters ?? defaultMinCharacters;
  }

  get placeholder() {
    return this.args.placeholder ?? defaultPlaceholder;
  }

  get displayLabel() {
    return this.args.displayLabel ?? defaultDisplayLabel;
  }

  get noResultsLabel() {
    return this.args.noResultsLabel ?? defaultNoResultsLabel;
  }

  get _loading() {
    return this.args.loading ?? this.throttleQuery.isRunning;
  }

  get canPerformSearch() {
    return this.searchString.length >= this.minCharacters;
  }

  get receivedResults() {
    return this.items != null;
  }

  get showResults() {
    return (
      this.isFocused &&
      this.canPerformSearch &&
      !this._loading &&
      this.receivedResults
    );
  }

  updateDisplayValue(selected) {
    const displayLabel = get(selected ?? {}, this.displayLabel);
    this.searchString = displayLabel ?? '';
  }

  selectItem(item) {
    if (!item) {
      item = this.items[this.activeItem];
    }
    this._onChange(item);
    this.updateDisplayValue(item);
    this.onBlur();
  }

  @restartableTask
  *throttleQuery(searchString) {
    yield timeout(this.searchTimeout);
    this.items = yield this.args.query(searchString);
    this.activeItem = -1;
    this.isFocused = true;
  }

  @action
  onBlur() {
    this.isFocused = false;
    this.items = null;
  }

  @action
  onFocus(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.isFocused || this.args.disabled) {
      return;
    }

    this.isFocused = true;
    this.activeItem = -1;
    if (this.canPerformSearch) {
      this.query(this.searchString);
    }
  }

  @action
  moveUp(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (this.activeItem !== 0) {
      this.activeItem--;
    }
  }

  @action
  moveDown(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (this.activeItem < this.items.length - 1) {
      this.activeItem++;
    }
  }

  @action
  onEnter(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.selectItem();
  }

  @action
  onEscape(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.onBlur();
  }

  @action
  onItemClick(item, evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.selectItem(item);
  }

  @action
  query(searchString) {
    this.throttleQuery.perform(searchString);
  }
}
