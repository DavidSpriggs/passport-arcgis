/**
 * Module dependencies.
 */
var util = require('util'),
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
  InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The ArcGIS authentication strategy authenticates requests by delegating to
 * ArcGIS using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your ArcGIS application's Client ID
 *   - `clientSecret`  your ArcGIS application's Client Secret
 *   - `callbackURL`   URL to which ArcGIS will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     'user', 'public_repo', 'repo', 'gist', or none.
 *                     (see http://developer.github.com/v3/oauth/#scopes for more info)
 *
 * Examples:
 *
 *     passport.use(new ArcGISStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/arcgis/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://www.arcgis.com/sharing/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://www.arcgis.com/sharing/oauth2/token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};

  OAuth2Strategy.call(this, options, verify);
  this.name = 'arcgis';
  this._userProfileURL = options.userProfileURL || 'https://www.arcgis.com/sharing/rest/community/self?f=json';
  this._oauth2.setAccessTokenName("token");
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from ArcGIS.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `arcgis`
 *   - `orgId`            the user's arcgis organization ID
 *   - `username`         the user's ArcGIS username
 *   - `fullName`         the user's full name
 *   - `email`            the user's email address
 *   - `role`             the user's role in org
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function(err, body, res) {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }

    try {
      var json = JSON.parse(body);

      var profile = {
        provider: 'arcgis'
      };
      profile.orgId = json.orgId;
      profile.fullname = json.fullName;
      profile.displayName = json.fullName;
      profile.username = json.username;
      profile.id = json.username;
      profile.email = json.email;
      profile.role = json.role;

      json.id = json.username;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;