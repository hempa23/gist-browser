/*global angular:false */

(function () {
    "use strict";
    describe('Gist Directive', function () {
        var scope,
            httpBackend,
            gService,
            uService,
            location,
            compile,
            publicGist_1 = {
                "files": {
                    "readme.txt": {"filename": "readme.txt", "type": "text/plain", "language": null, "size": 20, "content": "Read me - \n\n\n\n\nagain"
                    },
                    "lorem.txt": {"filename": "lorem.txt", "type": "text/plain", "language": null, "size": 19, "content": "No more lorem ipsum"
                    },
                    "module.js": {"filename": "module.js", "type": "application/javascript", "language": "JavaScript", "size": 495, "content": "angular.module('isAModule', [])\n.controller('imACtrl', ['$scope', '$http', function(scope, http){\n    scope.data = {};\n    scope.functions = {};\n    \n    scope.functions.getValues = function() {\n      http.get('http://example.com')\n        .success(function(vals) {\n          scope.data.values = vals;\n      }); \n    };\n}])\n.directive('imADirective', [function(){\n    return {\n        link: function(scope, elem, attrs) {\n            elem.css('background-color', '#7a7a7a');\n        }\n    }\n}]);"
                    },
                    "template.html": {"filename": "template.html", "type": "text/html", "language": "HTML", "size": 54, "content": "  <html>\n    <head></head>\n    <body></body>\n  </html>"
                    }
                }, "description": "Some files ..."
            },
            directive,
            createDirective;

        beforeEach(module('hesa.user'));
        beforeEach(module('templates-app'));
        beforeEach(angular.mock.module("restangular"));
        beforeEach(angular.mock.module('hesa.gists'));

        beforeEach(inject(function ($injector) {
            scope = $injector.get('$rootScope').$new();
            location = $injector.get('$location');
            uService = $injector.get('userService');
            httpBackend = $injector.get('$httpBackend');
            compile = $injector.get('$compile');

            gService = $injector.get('gistService');
            scope.gist = publicGist_1;
            scope.username = 'username';
            directive =
                '<gist id="gist.id" user="username" >' +
                    '<div ng-repeat="f in gist.files">' +
                    '<gist-file-pane title="f.filename">' +
                    '<textarea class="editor" gist-content="" ng-model="f.content" ng-blur="update(gist)"></textarea>' +
                    '</gist-file-pane>' +
                    '</div>' +
                    '</gist>';
            createDirective = '<create-gist gist="data.newGist" create="create"></create-gist>';

        }));

        it('gists a displayed and compiled correct', function () {

            var elements = compile(directive)(scope);
            scope.$digest();
            var e = angular.element(elements);

            var panes = e.find('li:not(.git-link)');
            expect(4).toEqual(panes.length);

            var text = angular.element(panes[0]).text().trim();
            expect('lorem.txt').toEqual(text);

            var tabContent = e.find('.tab-pane');
            expect(4).toEqual(tabContent.length);
        });

        it('inputs and buttons are displayed', function () {
            scope.gists = [];
            scope.data = {newGist : {'public':true}};
            scope.create = function() {console.log("Create"); };

            var createElement = compile(createDirective)(scope);
            scope.$digest();
            var element = angular.element(createElement);

            expect(element.find('button').length).toEqual(1);
            expect(element.find(':checkbox:checked').length).toEqual(1);

        });
    });
})();