/*global angular:false */
(function (angular) {
    "use strict";
    angular.module('hesa.gists', [])
        .controller('gistCtrl', ['$scope', 'userService', '$location', 'gists', 'gistService',
            function (scope, userService, loc, gists, gistService) {
                scope.data = {};

                scope.logout = function () {
                    if (userService.logout()) {
                        loc.path('/login');
                    }
                };

                scope.refresh = function () {
                    gistService.gists().then(function (updatedGists) {
                        scope.data.gists = updatedGists;
                    });
                };

                scope.update = function (gist) {
                    gistService.update(gist.id, gistService.transformForUpdate(gist))
                        .then(
                        function (d) {
                            gist = d;
                        },
                        function (e) {
                            scope.data.error = "Could not update gist";
                        }
                    );
                };

                scope.data.gists = gists;
            }])
        .factory('gistService', ['$http', '$q', '$rootScope', '$log', 'userService', 'Restangular', function (http, q, root, log, userService, Restangular) {
            var userGists = function () {
                    var defer = q.defer();

                    Restangular.one('users', root.username).getList('gists', {}, userService.getAuthHeader())
                        .then(
                        function (gistsData) {
                            defer.resolve(gistsData);
                        },
                        function (error) {
                            defer.reject(error);
                        }
                    );

                    return defer.promise;
                },
                userGistsById = function (gists) {
                    var defer = q.defer(),
                        gistsWithContent = [];
                    angular.forEach(gists, function (gist) {

                        Restangular.one('gists', gist.id).get({}, userService.getAuthHeader())
                            .then(
                            function (gist) {
                                gistsWithContent.push(gist);
                            },
                            function (error) {
                                log.error(error);
                            }
                        );
                    });

                    defer.resolve(gistsWithContent);
                    return defer.promise;
                };

            return {
                gists: function () {
                    return userGists().then(userGistsById);
                },
                transformForUpdate: function (gist) {
                    var updatedFiles = {};
                    angular.forEach(gist.files, function (file) {
                        updatedFiles[file.filename] = {'content': file.content};
                    });

                    return {
                        description: gist.description,
                        files: updatedFiles
                    };
                },
                update: function (id, updatedGist) {
                    var gist = Restangular.one('gists', id);
                    return gist.patch(updatedGist, {}, userService.getAuthHeader());
                }
            };
        }])
        .directive('gist', function () {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: {
                    user: '=',
                    id: '='
                },
                templateUrl: 'gist/gist-tab.tpl.html',
                controller: function ($scope) {
                    var panes = $scope.panes = [];

                    $scope.select = function (pane) {
                        angular.forEach(panes, function (pane) {
                            pane.selected = false;
                        });
                        pane.selected = true;
                    };

                    this.addPane = function (pane) {
                        if (panes.length === 0) {
                            $scope.select(pane);
                        }
                        panes.push(pane);
                    };
                }
            };
        })
        .directive('gistFilePane', function () {
            return {
                require: '^gist',
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    title: '='
                },
                templateUrl: 'gist/gist-pane.tpl.html',
                link: function (scope, element, attrs, gistCtrl) {
                    gistCtrl.addPane(scope);
                }
            };
        })
        .directive('gistContent', [function () {
            var handleMouseEvent = function (element) {
                element.onmouseup = function () {
                    element.onmouseup = null;
                    return false;
                };
            };

            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    var textarea = elem[0],
                        orgHeight,
                        ngTextarea = angular.element(textarea);

                    ngTextarea.on("focus", function (e) {
                        var target = e.target;
                        orgHeight = target.clientHeight + 'px';
                        target.style.height = target.scrollHeight + 'px';

                        target.select();
                        handleMouseEvent(target);

                    });
                    // reset to org height with a default value
                    ngTextarea.on('blur', function (e) {
                        e.target.style.height = orgHeight || '100px';
                    });
                }
            };
        }]);
})(angular);