"use strict";
angular.module('user', []).
    controller('loginCtrl', ['$scope', 'userService', '$location', function (scope, userService, l) {
        scope.credentials = {};

        scope.auth = function() {
            if(userService.login(scope.credentials) && scope.username.length > 0) {
                l.path("/gists");
            }

        }
    }])
    .factory('userService', ['$http', '$q', '$location', '$log', '$rootScope', function (http, q, loc, log, $root) {
        return {
            login: function (cred) {
                $root.username = cred.id;
                return true;
            },
            logout: function() {
                $root.username = undefined;
                return true;
            },
            hasGistRepo: function() {
                return !$root.username;
            }
        }
    }]);
