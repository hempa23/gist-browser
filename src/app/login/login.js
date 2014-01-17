/*global angular:false */
(function(angular) {
    "use strict";
angular.module('hesa.user', []).
    controller('loginCtrl', ['$scope', 'userService', '$location', function (scope, userService, location) {
        scope.credentials = {};

        scope.auth = function() {
            scope.error = undefined;

            userService.login(scope.credentials).then(function(res) {
                if(res) {
                    location.path("/gists");
                } else {
                    scope.error = "Wrong username and/or password";
                }
            });
        };
    }])
    .factory('userService', ['$http', '$q', '$location', '$log', '$rootScope', function (http, q, location, log, $root) {
        var authHeader;
        return {
            login: function (cred) {
                var defer = q.defer(),
                    loginHeader = 'Basic ' + btoa(cred.id + ':' + cred.sec); //Encode

                http({method: 'POST', url: 'https://api.github.com/user', data: {}, headers : {
                    'Authorization' : loginHeader,
                    'Content-Type' : 'application/json;charset=UTF-8'
                }})
                .success(function(data){
                    $root.username = data.login;
                    $root.fullname = data.name;
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
            userLoggedIn: function() {
                return authHeader !== undefined;
            },
            getAuthHeader: function () {
                return authHeader;
            }
        };
    }]);
})(angular);
