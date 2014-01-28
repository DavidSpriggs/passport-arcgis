var vows = require('vows');
var assert = require('assert');
var util = require('util');
var ArcGISStrategy = require('passport-arcgis/strategy');


vows.describe('ArcGISStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new ArcGISStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },
    
    'should be named arcgis': function (strategy) {
      assert.equal(strategy.name, 'arcgis');
    }
  },
  
 
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new ArcGISStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        if (url == 'https://www.arcgis.com/sharing/rest/community/self?f=json') {
          var body = '{ "orgId": "5555567", "fullName": "fullName", "email": "octocat@arcgis.com", "username": "userName", "role": "admin" }';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL'));
        }
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'arcgis');
        assert.equal(profile.id, 'userName');
        assert.equal(profile.username, 'userName');
        assert.equal(profile.displayName, 'fullName');
        assert.equal(profile.role, 'admin');
        assert.equal(profile.email, 'octocat@arcgis.com');
        assert.equal(profile._json.id, 'userName');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new ArcGISStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);
