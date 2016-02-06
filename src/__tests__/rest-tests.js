"use strict";

describe('tests for url parsing', function(){
  it('checks expansions', function() {
    var Rest = require('../rest.js');
    var api = new Rest('/api');
    expect(api._getUrl(['users', 'me'])).toEqual('/api/users/me');
    // Example from https://blogs.dropbox.com/developers/2015/03/json-in-urls/
    var params = JSON.stringify({a: "b", c: 4});
    expect(api._getUrl(['users', 'me'], params)).toEqual(
      '/api/users/me?%7B%22a%22%3A%22b%22%2C%22c%22%3A4%7D');
  });

  it('checks expansions with default get params', function() {
    var Rest = require('../rest.js');
    var api = new Rest('/api?authentication=foobar');
    expect(api._getUrl(['users', 'me'])).toEqual(
      '/api/users/me?authentication=foobar');
    expect(api._getUrl(['users', 'me'], {foo: 'bar'})).toEqual(
      '/api/users/me?authentication=foobar&foo=bar');
  })
});


describe('Test REST without options', function () {
  var api;

  beforeEach(function() {
    var Rest = require('../rest.js');
    api = new Rest();
  })

  afterEach(function() {
    expect(api.__getPending()).toEqual([]);
  })

  pit('calls the get api', function () {
    api.__setResponse('/me?foo=bar', JSON.stringify({foo: 'bar'}));
    return api.get('me', {foo: 'bar'}).then(resp => {
      expect(resp).toEqual({foo: 'bar'});
      expect(window.fetch).toBeCalledWith('/me?foo=bar', {
        headers: { Accept: 'application/json' },
        method: 'get'
      });
    });
  });

  pit('calls the post api', function () {
    api.__setResponse('/logout', JSON.stringify({foo: 'bar'}));
    return api.post('logout', { foo: 'bar' }).then(resp => {
      expect(resp).toEqual({foo: 'bar'});
      expect(window.fetch).toBeCalledWith('/logout', {
        body: '{"foo":"bar"}',
        headers: {
          Accept: 'application/json',
          "Content-Type": 'application/json'
        },
        method: 'post'
      });
    });
  });

  pit('calls the post api with empty data', function() {
    api.__setResponse('/logout', JSON.stringify({foo: 'bar'}));
    return api.post('logout').then(resp => {
      expect(resp).toEqual({foo: 'bar'});
      expect(window.fetch).toBeCalledWith(
        '/logout',
        { headers: { Accept: 'application/json' },
          method: 'post'
        }
      );
    });
  });

  pit('calls the delete api', function() {
    api.__setResponse('/posts/33', JSON.stringify({foo: 'bar'}));
    return api.delete(['posts', 33], {foo: 'bar'}).then(resp => {
      expect(resp).toEqual({foo: 'bar'});
      expect(window.fetch).toBeCalledWith(
        '/posts/33',
        { body: '{"foo":"bar"}',
          headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json'
          },
          method: 'delete'
        }
      );
    });
  });
});


describe('Test REST with options', function () {
  var api;

  beforeEach(function() {
    var Rest = require('../rest.js');
    var options = function(defaults) {
      defaults.credentials = 'same-origin';
      if(defaults.method != 'get')
        defaults.headers['X-CSRFToken'] = 'AUTHTOKENX';
    }
    var useTrailingSlashes = true;
    api = new Rest('/base/', options, useTrailingSlashes);
  })

  afterEach(function() {
    expect(api.__getPending()).toEqual([]);
  })

  pit('calls the get api', function() {
    api.__setResponse('/base/me/', JSON.stringify({foo: 'bar'}));
    return api.get('me').then(resp => {
      expect(resp).toEqual({foo: "bar"});
      expect(window.fetch).toBeCalledWith(
        '/base/me/',
        {
          credentials: 'same-origin',
          headers: {Accept: 'application/json'},
          method: 'get'
        }
      );
    });
  });

  pit('calls the post api', function() {
    api.__setResponse('/base/logout/', JSON.stringify({foo: 'bar'}));
    return api.patch('logout', {foo: 'bar'}).then(resp => {
      expect(resp).toEqual({foo: "bar"});
      expect(window.fetch).toBeCalledWith(
        '/base/logout/',
        { body: '{"foo":"bar"}',
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            'X-CSRFToken': 'AUTHTOKENX'
          },
          method: 'patch'
        }
      );
    })
  });

});
