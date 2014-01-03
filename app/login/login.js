"use strict";
angular.module('user', []).
    controller('loginCtrl', ['$scope', 'userService', '$location', function (scope, userService, l) {
        scope.credentials = {};

        scope.auth = function() {
            scope.error = undefined;
            userService.login(scope.credentials).then(function(res) {
                if(res) {
                    l.path("/gists");
                } else {
                    scope.error = "Wrong username and/or password";
                }
            });
        }
    }])
    .factory('userService', ['$http', '$q', '$location', '$log', '$rootScope', function (http, q, loc, log, $root) {
        var authHeader;
        return {
            login: function (cred) {
                var defer = q.defer();
                var loginHeader = 'Basic ' + btoa(cred.id + ':' + cred.sec);

                http({method: 'POST', url: 'https://api.github.com/user', data: JSON.stringify({}), headers : {
                    'Authorization' : loginHeader,
                    'Content-Type' : 'application/json;charset=UTF-8'
                }})
                .success(function(data){
                    $root.username = cred.id;
                    authHeader = {'Authorization' : loginHeader};
                    defer.resolve(true);
                })
                .error(function(error){
                    defer.resolve(false);
                });

                return defer.promise;
            },
            logout: function() {
                $root.username = undefined;
                authHeader = undefined;
                return true;
            },
            hasGistRepo: function() {
                return !authHeader;
            },
            getAuthHeader: function () {
                return authHeader;
            }
        }
    }]);
