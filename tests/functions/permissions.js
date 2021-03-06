/* jshint expr: true */

var should = require('should'),
  rewire = require('rewire'),
  permissionsFunctions = rewire('../../lib/functions/permissions');

/**
 * @return {Object} The _permissions object
 */
getPermissions = function() {
  return permissionsFunctions.__get__('_permissions');
};

/**
 * Clear the permissions object between each test.
 */
beforeEach(function clearPermissions() {
  Object.keys(getPermissions()).forEach(function(key) {
    delete getPermissions()[key];
  });
});

describe('permissions', function() {

  describe('#_permissions', function() {
    it('should be initially empty', function() {

      getPermissions().should.have.type('object')
        .and.be.empty;
    });
  });

  describe('#_splitPermissionUris(permissions)', function() {

    it('should generate an array of the approprate length', function() {

      permissionsFunctions.addPermission('/protected', 'GET', 'login');
      permissionsFunctions.addPermission('/protected/further', 'GET', 'login-and-more');
      permissionsFunctions.addPermission('/protected/further', 'PUT', 'login-and-put');
      permissionsFunctions.addPermission('/protected/further/deeper/', 'GET', 'rabbit-hole');

      var splitPermissions = permissionsFunctions.__get__('_splitPermissionUris')(getPermissions());

      splitPermissions.should.have.length(3);
    });

  it('should filter empty uri segments', function() {

      permissionsFunctions.addPermission('/', 'GET', 'login');

      var splitPermissions = permissionsFunctions.__get__('_splitPermissionUris')(getPermissions());

      splitPermissions[0].splitUri.should.have.length(0);
    });

  });

  describe('#addPermission(uri, verb, permission)', function() {

    it('should throw an InvalidArgumentError if no arguments are supplied', function() {

      (permissionsFunctions.addPermission()).should.throw('InvalidArgumentError');
    });

    it('should throw an InvalidArgumentError if invalid arguments are supplied', function() {

      (permissionsFunctions.addPermission(1, 2, 3)).should.throw('InvalidArgumentError');
    });

    it('should throw PermissionCollissionError if two permissions are set for the same uri+verb', function() {

      permissionsFunctions.addPermission('/', 'GET', 'first-permission');
      (permissionsFunctions.addPermission('/', 'GET', 'second-permission')).should.throw('PermissionCollissionError');
    });

    it('should convert verb to lower case', function() {

      permissionsFunctions.addPermission('/test/uri', 'GET', 'test-permission');

      getPermissions()['/test/uri'].should.have.property('get');
    });

    it('should apply the given arguments to the permissions object appropriately', function() {

      permissionsFunctions.addPermission('/test/uri', 'GET', 'test-permission');

      getPermissions().should.have.type('object')
        .with.property('/test/uri')
        .with.property('get', 'test-permission');
    });
  });

  describe('#lookupPermissions(uri, verb)', function() {

    beforeEach(function primePermissions() {
      permissionsFunctions.addPermission('/protected', 'GET', 'login');
      permissionsFunctions.addPermission('/protected/further', 'GET', 'login-and-more');
      permissionsFunctions.addPermission('/protected/further', 'PUT', 'login-and-put');
      permissionsFunctions.addPermission('/protected/further/deeper', 'GET', 'rabbit-hole');
    });

    it('should throw an InvalidArgumentError if no arguments are supplied', function() {

      (permissionsFunctions.lookupPermissions()).should.throw('InvalidArgumentError');
    });

    it('should throw an InvalidArgumentError if invalid arguments are supplied', function() {

      (permissionsFunctions.lookupPermissions(1, 'verb')).should.throw('InvalidArgumentError');
      (permissionsFunctions.lookupPermissions('uri', 2)).should.throw('InvalidArgumentError');
    });

    it('should find the permission representing the given uri and verb in the tree', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'GET').should.contain('login-and-more');
    });

    it('should convert verb to lower case', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'GET').should.contain('login-and-more');
    });

    it('should return an empty array if no permissions were found', function() {

      permissionsFunctions.lookupPermissions('/protected/further', 'del').should.be.empty;
    });
  });

  describe('#flatPermissionTree()', function() {

    beforeEach(function primePermissions() {
      permissionsFunctions.addPermission('/', 'get', 'permission-root-get');
      permissionsFunctions.addPermission('/', 'del', 'permission-root-del');
      permissionsFunctions.addPermission('/', 'put', 'permission-root-put');
      permissionsFunctions.addPermission('/child', 'put', 'permission-child-put');
      permissionsFunctions.addPermission('/child/second', 'put', 'permission-child-second-put');
      permissionsFunctions.addPermission('/child/second/third', 'put', 'permission-child-third-put');
    });

    it('should return a flat permission tree containing appropriate items', function() {

      permissionsFunctions.flatPermissionTree().should.have.length(4);
    });

    it('should return a flat permisson tree with parent and child populated appropriately', function() {

      var flatPermissionTree = permissionsFunctions.flatPermissionTree();

      flatPermissionTree.forEach(function(permission) {
        if (permission.uri == '/child') {
          permission.should.have.property('parent', '/');
        } else if (permission.uri == '/') {
          permission.should.not.have.property('parent');
        }
      });
    });
  });

});
