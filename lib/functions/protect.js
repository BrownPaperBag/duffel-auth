var permissions = require('./permissions.js');

var protect = function(verb, parameters) {
  if (parameters.length < 2) {
    throw new Error('Protect must be called with at least the URI and permission name');
  }

  // Convert parameters into an array
  var args = Array.prototype.slice.call(parameters);

  var uri = args[0];
  var permission = args[1];
  permissions.addPermission(uri, verb, permission);

  // Remove the permission argument
  args.splice(1, 1);

  // Add to express' routes
  return this[verb].apply(this, args);
}
/**
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next
 */
module.exports = function(app) {
  return {
    get: function() {
      return protect.call(app, 'get', arguments);
    }.bind(app),
    post: function() {
      return protect.call(app, 'post', arguments);
    }.bind(app),
    put: function() {
      return protect.call(app, 'put', arguments);
    }.bind(app),
    del: function() {
      return protect.call(app, 'del', arguments);
    }.bind(app),
  }
}