/*global angular:false */
(function (angular) {
    "use strict";
    angular.module('hesa.gists', [])
        .controller('gistCtrl', ['$scope', 'userService', '$location', 'gists', 'gistService', '$rootScope',
            function (scope, userService, loc, gists, gistService, root) {
                scope.data = {
                    username: root.username,
                    ownGists: true
                };

                scope.$watch("data.username", function (newVal, oldVal) {
                    scope.data.ownGists = (newVal === root.username);
                });

                scope.logout = function () {
                    if (userService.logout()) {
                        loc.path('/login');
                    }
                };

                scope.browse = function () {
                    if (scope.data.username) {
                        gistService.gists(scope.data.username).then(
                            function (gists) {
                                scope.data.gists = gists;
                            }, function (err) {
                                scope.data.gists = [];
                                scope.data.error = 'Gists ' + err.message + ' for ' + scope.data.username;
                            });
                    }
                };

                scope.update = function (gist) {
                    if (scope.data.ownGists) {
                        gistService.update(gist.id, gistService.transformForUpdate(gist))
                            .then(
                            function (d) {
                                gist = d;
                            },
                            function (e) {
                                scope.data.error = "Could not update gist";
                            }
                        );
                    }
                };

                scope.star = function (id) {
                    gistService.star(id).then(function (res) {

                    }, function (e) {
                        
                    });
                };

                scope.data.gists = gists;
            }])
        .factory('gistService', ['$http', '$q', '$rootScope', '$log', 'userService', 'Restangular',
            function (http, q, root, log, userService, Restangular) {
                var userGists = function (username) {
                        var defer = q.defer();

                        Restangular.one('users', username).getList('gists', {}, userService.getAuthHeader())
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
                                    log.error("Gist by id", error);
                                }
                            );
                        });

                        defer.resolve(gistsWithContent);
                        return defer.promise;
                    },
                    errorHandler = function (err) {
                        return q.reject(err.data);
                    };

                return {
                    gists: function (username) {
                        return userGists(username).then(userGistsById, errorHandler);
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
                    },
                    star: function (id) {
                        var gist = Restangular.one('gists', id).one('star');
                        return gist.put({}, userService.getAuthHeader());
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