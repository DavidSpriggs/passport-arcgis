var vows = require('vows');
var assert = require('assert');
var util = require('util');
var arcgis = require('passport-arcgis');


vows.describe('passport-arcgis').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(arcgis.version);
    },
  },
  
}).export(module);
