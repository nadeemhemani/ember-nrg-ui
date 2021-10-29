import Component from '@ember/component';
import layout from '../../../templates/components/nrg-list/header/search';
import { observer } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import GlobalKeyboardShortcutsMixin from 'ember-nrg-ui/mixins/global-keyboard-shortcut';

export default Component.extend(GlobalKeyboardShortcutsMixin, {
  layout,
  classNames: ['item'],
  placeholder: 'Search...',
  searchString: null,

  keyboardShortcuts: [
    {
      key: 'KeyS',
      actionName: 'focus',
      description: 'Focus Search Box',
    },
  ],

  init() {
    this._super(...arguments);
    this.searchTask.perform(true);
  },

  searchStringObserver: observer('searchString', function() {
    this.searchTask.perform();
  }),

  searchTask: task(function*(immediate) {
    const searchString = this.searchString;
    if (searchString === null) {
      return;
    }
    if (!immediate) {
      yield timeout(400);
    }
    this.changed(searchString);
  }).restartable(),

  actions: {
    focus() {
      const input = this.element.querySelector('input');
      if (input) {
        input.focus();
      }
    },
  },
});