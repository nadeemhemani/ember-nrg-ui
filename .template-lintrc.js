'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'no-curly-component-invocation': {
      allow: ['nrg-app-version'],
    },
    'no-implicit-this': {
      allow: ['nrg-app-version'],
    },
  },
};
