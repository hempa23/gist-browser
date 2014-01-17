/*global angular:false */

(function () {
    "use strict";

describe('GistController', function () {
    var gistCtrl,
        scope,
        httpBackend,
        gService,
        uService,
        location,
        gistIds = [{"id": "081b084e13fd0318c097"},{"id": "8140072"},{"id": "8138254"}],
        privateGist = {
            "files": {"fsdaffds": {"filename": "fsdaffds","type": "text/plain","language": null,"size": 31,"content": "Some interesting content maybe?"}
            },"description": "Private"
        },
        publicGist_1 = {"files": {
                "readme.txt": {"filename": "readme.txt","type": "text/plain","language": null,"size": 20,"content": "Read me - \n\n\n\n\nagain"
                },
                "lorem.txt": {"filename": "lorem.txt","type": "text/plain","language": null,"size": 19,"content": "No more lorem ipsum"
                },
                "module.js": {"filename": "module.js","type": "application/javascript","language": "JavaScript","size": 495,"content": "angular.module('isAModule', [])\n.controller('imACtrl', ['$scope', '$http', function(scope, http){\n    scope.data = {};\n    scope.functions = {};\n    \n    scope.functions.getValues = function() {\n      http.get('http://example.com')\n        .success(function(vals) {\n          scope.data.values = vals;\n      }); \n    };\n}])\n.directive('imADirective', [function(){\n    return {\n        link: function(scope, elem, attrs) {\n            elem.css('background-color', '#7a7a7a');\n        }\n    }\n}]);"
                },
                "template.html": {"filename": "template.html","type": "text/html","language": "HTML","size": 54,"content": "  <html>\n    <head></head>\n    <body></body>\n  </html>"
                }
            },"description": "Some files ..."
        },
        publicGist_2 = {
            "files": {"module.js": {"filename": "module.js","type": "application/javascript","language": "JavaScript","size": 94,"content": "(function(){\n  var f12 = function() {\n    //do stuff\n  }\n  return {\n    doStuff: f12\n  }\n})();"
                }
            },"description": "First test gist"
        };


    beforeEach(module('hesa.user'));
    beforeEach(angular.mock.module("restangular"));
    beforeEach(angular.mock.module('hesa.gists'));

    beforeEach(inject(function ($injector, $httpBackend, _$location_) {
        var $controller = $injector.get('$controller');
        scope = $injector.get('$rootScope').$new();
        location = _$location_;
        uService = $injector.get('userService');
        httpBackend = $httpBackend;
        gService = $injector.get('gistService');

        scope.data = {};
        gistCtrl = $controller('gistCtrl', {
            $scope: scope,
            userService: uService,
            $location: location,
            gists: {},
            gistService: gService
        });
        httpBackend.when('POST', 'https://api.github.com/user').respond(200, {"login": "username","id": 2345678});
        httpBackend.when('GET', '/users/username/gists').respond(gistIds);
        httpBackend.when('GET', '/gists/081b084e13fd0318c097').respond(privateGist);
        httpBackend.when('GET', '/gists/8140072').respond(publicGist_1);
        httpBackend.when('GET', '/gists/8138254').respond(publicGist_2);

    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    function fakeLogin() {
        httpBackend.expectPOST('https://api.github.com/user').respond(200, {"login": "username","id": 2345678});
        uService.login({id: 'username', sec: 'password'});
        httpBackend.flush();
    }

    it('can get gists from api', function () {
        fakeLogin();
        httpBackend.expectGET('/users/username/gists');
        httpBackend.expectGET('/gists/081b084e13fd0318c097');
        httpBackend.expectGET('/gists/8140072');
        httpBackend.expectGET('/gists/8138254');
        var expectedGists = [privateGist, publicGist_1, publicGist_2];

        expect(scope.data.gists).toEqual({});

        scope.refresh();
        httpBackend.flush();

        expect(scope.data.gists.length).toEqual(expectedGists.length);
    });

    it('can transform a gist before update', function() {
        var expectedResult = {
            description: privateGist.description,
            files: {
                'fsdaffds' : {
                    'content' : 'New content'
                }
            }
        };

        privateGist.files['fsdaffds'].content = 'New content';
        var result = gService.transformForUpdate(privateGist);

        expect(expectedResult).toEqual(result);
    });



});
    })();