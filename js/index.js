const app = angular
    .module("myApp", [])
    .controller("myCont", $scope => {
        $scope.myItems = [
            "apple",
            "banana",
            "potato",
            "sandwich",
            "beans",
            "cookie",
            "cake",
            "sushi",
            "bread",
            "lettuce",
            "tomato",
            "pizza",
            "hamburger",
            "cheeseburger"
        ].map(q=>({name:q,num:Math.ceil(Math.random()*15)}));
        $scope.derp = [];
        $scope.myFilter = (a, f) => {
            // console.log("filter", a, f);
            if (!f) {
                return (a && a.length && a) || [];
            }
            return a.filter(q => q.name.toLowerCase().includes(f.toLowerCase()));
        };
    })
    .directive("simpleAutoSuggest", function ($sce) {
        return {
            restrict: "E",
            scope: {
                items:'=simpleAutoItems',
                subItem: '@simpleAutoSubItem',
                filterFn:'=simpleAutoFilter',
                adtnlClasses:'@simpleAutoClasses',
                adtnlStyles:'@simpleAutoStyles',
                nfText:'@simpleAutoNotFoundText',
                nfFunc:'=simpleAutoNotFoundFn',
                output:'=simpleAutoOutput',
            },
            template: `<div class='sas-cont'>
            <input class='sas-inp {{adtnlClasses}}' style='{{adtnlStyles}}' type='text' ng-model='filterSearch' ng-keyup='doFilter()' />
            <div style='width:{{inpBoxDims.width}}px; min-height:100px;' ng-show='hasFocus && ((filteredItems && filteredItems.length)||showNFBox)'>
                    <div ng-repeat='si in filteredItems' class='simple-auto-suggest-suggestion' ng-click='pickItem(si);$event.stopPropagation();' ng-bind-html='hilite(si,subItem)'></div>
                    <div ng-if='showNFBox'>
                        {{notFoundText}} <a href='#' ng-click='notFoundFunction(filterSearch)'>Click to add item</a>
                    </div>
                </div>
        </div>`,
            link: function (scope, element, attributes) {
                console.log("ATTRIBUTES", attributes, "ELEMENT", element,'SCOPE',scope);
                scope.hasFocus = true;
                const inpBox = element[0].querySelector(".sas-inp");
                setTimeout(function () {
                    scope.inpBoxDims = element[0]
                        .querySelector(".sas-inp")
                        .getBoundingClientRect();
                }, 1);
                scope.focFunc = e =>{
                    console.log('ng fokis',e)
                }
                scope.blurFunc = e =>{
                    console.log('ng blerr',e)
                }
                scope.showNFBox = false;
                scope.doFilter = () => {
                    const filterOkay =
                        scope.filterFn &&
                        typeof scope.filterFn === "function" &&
                        scope.items &&
                        (scope.items instanceof Array);
                    scope.filteredItems =
                        (scope.filterSearch &&
                            scope.filterSearch.length &&
                            filterOkay &&
                            scope.filterFn(scope.items, scope.filterSearch)) ||
                        null;
                    console.log(
                        "FILTERED STOOF", scope.filteredItems,
                        "SEARCH TERM",
                        scope.filterSearch,
                        'ALL ITEMS',
                        scope.linkedItems,
                        'Filter okay?', filterOkay
                    );
                    scope.showNFBox =
                        !!scope.filterSearch &&
                        (!scope.filteredItems || !scope.filteredItems.length);
                        // scope.$digest();
                }
                scope.pickItem = it => {
                    if(scope.output && scope.output!=='null'){
                        //three different possibilities. First, if we're given a function, run dat function. Second, if it's an array, push into array. Thirdly, if neither, just replace
                        if(typeof scope.output==='function'){
                            console.log('output is fn!')
                            scope.output(it);
                        }else if(scope.output instanceof Array){
                            console.log('output is array')
                            scope.output.push(it);
                        }else{
                            scope.output=it;
                        }
                        scope.filterSearch = null;
                    }else{
                        scope.filterSearch = it;
                    }
                    scope.filteredItems = [];
                    console.log('PARENT NOW',scope.$parent,scope.output)
                };
                console.log('THIS SAS IS',element[0].querySelector('.sas-cont'))
                scope.hilite = t => {
                    const termString = scope.subItem && t[scope.subItem]?t[scope.subItem]:typeof t!=='string'?JSON.stringify(t):t,
                    pos = termString.indexOf(scope.filterSearch);
                    return $sce.trustAsHtml(
                        `${termString.slice(0, pos)}<strong>${scope.filterSearch}</strong>${termString.slice(
                            scope.filterSearch.length + pos
                        )}`
                    );
                };
                element[0].querySelector('.sas-inp').addEventListener(
                    "focus",
                    function (e) {
                        // console.log('focus event', e,this)
                        scope.hasFocus = true;
                        scope.$digest();
                    },
                    false
                );
                element[0].querySelector('.sas-inp').addEventListener(
                    "blur",
                    function (e) {
                        setTimeout(function () {
                            console.log('event',e,'new Focus',document.elementFromPoint(scope.x,scope.y))
                            if(!document.elementFromPoint(scope.x,scope.y).className.includes('simple-auto-suggest-suggestion')){

                                scope.hasFocus = false;
                                scope.$digest();
                            }
                        }, 1);
                    },
                    false
                );
                element[0].addEventListener('mousemove',function simpMouse(e){
                    // console.log('MOUSE POS (client)',e.clientX,e.clientY)
                    scope.x = e.clientX;
                    scope.y = e.clientY;
                })
            }
        };
    });
/*
<simple-auto-suggest simple-auto-items='myItems' simple-auto-filter='myFilter' simple-auto-classes='input is-half' simple-auto-styles='width:25%;' simple-auto-not-found-text='Cannot find item!' simple-auto-not-found-fn='null' simple-auto-output='derp'></simple-auto-suggest>
    Item list: simple-auto-items
    Filter Function: simple-auto-filter
    CSS Classes: simple-auto-classes
    In-line Styles: simple-auto-styles
    Not Found text: simple-auto-not-found-text
    Not Found function (run when no matches): simple-auto-not-found-fn
    Output (function OR array OR string): simple-auto-output

    scope.adtnlClasses = (attributes && attributes.simpleAutoClasses) || "";
                scope.adtnlStyles = (attributes && attributes.simpleAutoStyles) || "";
                scope.output = (attributes && attributes.simpleAutoOutput) || null;
                scope.notFoundText = (attributes && attributes.simpleAutoNotFoundText) || "";
                scope.notFoundFunction = scope.filterFn = (attributes && attributes.simpleAutoNotFoundFn && typeof scope.$parent[attributes.simpleAutoNotFoundFn] == 'function') ? scope.$parent[attributes.simpleAutoNotFoundFn] :function(o){alert('Cannot find item: '+JSON.stringify(o))};
                scope.filterFn = (attributes && attributes.simpleAutoFilter && typeof scope.$parent[attributes.simpleAutoFilter] == 'function') ? scope.$parent[attributes.simpleAutoFilter] :((a,f)=>(a.includes(f)));
                scope.linkedItems = scope.$parent && scope.$parent[attributes.simpleAutoItems] && (scope.$parent[attributes.simpleAutoItems] instanceof Array) ? scope.$parent[attributes.simpleAutoItems] : [];
                scope.hasFocus = true;
                const inpBox = element[0].querySelector(".sas-inp");
                setTimeout(function () {
                    scope.inpBoxDims = element[0]
                        .querySelector(".sas-inp")
                        .getBoundingClientRect();
                }, 1);
                scope.focFunc = e =>{
                    console.log('ng fokis',e)
                }
                scope.blurFunc = e =>{
                    console.log('ng blerr',e)
                }
                scope.showNFBox = false;
                scope.doFilter = () => {
                    const filterOkay =
                        scope.filterFn &&
                        typeof scope.filterFn === "function" &&
                        scope.linkedItems &&
                        (scope.linkedItems instanceof Array);
                    scope.filteredItems =
                        (scope.filterSearch &&
                            scope.filterSearch.length &&
                            filterOkay &&
                            scope.filterFn(scope.linkedItems, scope.filterSearch)) ||
                        null;
                    console.log(
                        "FILTERED STOOF", scope.filteredItems,
                        "SEARCH TERM",
                        scope.filterSearch,
                        'ALL ITEMS',
                        scope.linkedItems,
                        'Filter okay?', filterOkay
                    );
                    scope.showNFBox =
                        !!scope.filterSearch &&
                        (!scope.filteredItems || !scope.filteredItems.length);
                        // scope.$digest();
                }
                scope.pickItem = it => {
                    if(scope.output && scope.output!=='null'){
                        //three different possibilities. First, if we're given a function, run dat function. Second, if it's an array, push into array. Thirdly, if neither, just replace
                        if(typeof scope.$parent[scope.output]==='function'){
                            scope.$parent[scope.output](it);
                        }else if(scope.$parent[scope.output] instanceof Array){
                            scope.$parent[scope.output].push(it);
                        }else{
                            scope.$parent[scope.output]=it;
                        }
                        scope.filterSearch = null;
                    }else{
                        scope.filterSearch = it;
                    }
                    scope.filteredItems = [];
                    console.log('PARENT NOW',scope.$parent,scope.output)
                };
                console.log('THIS SAS IS',element[0].querySelector('.sas-cont'))
                scope.hilite = t => {
                    const pos = t.indexOf(scope.filterSearch);
                    return $sce.trustAsHtml(
                        `${t.slice(0, pos)}<strong>${scope.filterSearch}</strong>${t.slice(
                            scope.filterSearch.length + pos
                        )}`
                    );
                };
                element[0].querySelector('.sas-inp').addEventListener(
                    "focus",
                    function (e) {
                        // console.log('focus event', e,this)
                        scope.hasFocus = true;
                        scope.$digest();
                    },
                    false
                );
                element[0].querySelector('.sas-inp').addEventListener(
                    "blur",
                    function (e) {
                        setTimeout(function () {
                            console.log('event',e,'new Focus',document.elementFromPoint(scope.x,scope.y))
                            if(!document.elementFromPoint(scope.x,scope.y).className.includes('simple-auto-suggest-suggestion')){

                                scope.hasFocus = false;
                                scope.$digest();
                            }
                        }, 1);
                    },
                    false
                );
                window.addEventListener('mousemove',function simpMouse(e){
                    // console.log('MOUSE POS (client)',e.clientX,e.clientY)
                    scope.x = e.clientX;
                    scope.y = e.clientY;
                })
*/