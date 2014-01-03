"use strict";
angular.module('gist', ['ngRoute', 'user', 'gists', 'restangular'])
    .config(['$routeProvider', '$httpProvider', 'RestangularProvider', function ($route, httpProvider, RestangularProvider) {
        $route.when('/', {
            templateUrl: 'app/login/login.tpl.html',
            controller: 'loginCtrl'
        })
            .when('/gists', {
                templateUrl: 'app/gist/edit.tpl.html',
                controller: 'gistCtrl',
                resolve: {
                    gists: ['gistService', function (gistService) {
                        return gistService.gists().then(function (gists) {
                            return gists;
                        })
                    }]}})
            .otherwise({
                redirectTo: '/'
            });

        httpProvider.defaults.useXDomain = true;
        delete httpProvider.defaults.headers.common['X-Requested-With'];

        RestangularProvider.setBaseUrl('https://api.github.com/');

    }]);