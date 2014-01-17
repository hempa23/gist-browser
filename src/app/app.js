/*global angular:false */
(function(angular) {
    "use strict";
    angular.module('gist', ['ngRoute', 'hesa.user', 'hesa.gists', 'restangular', 'templates-app'])
        .config(['$routeProvider', '$httpProvider', 'RestangularProvider', function ($route, httpProvider, RestangularProvider) {
            $route
                .when('/', {
                    templateUrl: 'login/login.tpl.html',
                    controller: 'loginCtrl'
                })
                .when('/gists', {
                    templateUrl: 'gist/edit.tpl.html',
                    controller: 'gistCtrl',
                    resolve: {
                        gists: ['gistService', 'userService', '$location', function (gistService, userService, location) {
                            if (userService.userLoggedIn()) {
                                return gistService.gists().then(function (gists) {
                                    return gists;
                                });
                            } else {
                                location.path('/login');
                            }
                        }]}})
                .otherwise({
                    redirectTo: '/'
                });

            RestangularProvider.setBaseUrl('https://api.github.com/');

        }]);
})(angular);
