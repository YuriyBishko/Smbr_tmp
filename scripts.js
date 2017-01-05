angular.module('appMain', ['ngRoute', 'angularMoment', 'angular-loading-bar', 'ngSanitize', '720kb.socialshare', 'myApp.filters', 'MailChimpSubscription'])
	.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
		cfpLoadingBarProvider.includeSpinner = false;
		cfpLoadingBarProvider.includeBar = true;
	}])
	.controller('mainCtr', ['$scope', '$http', '$sce', 'WPService', function($scope, $http, $sce, WPService){
		var page = 1;
		$scope.widget = '';

		$http.get('/wp-json/wp/v2/posts?filter[category_name]=news&filter[post_status]=publish&filter[posts_per_page]=5&page=' + page + '&filter[orderby]=date&filter[order]=desc')
						.success(function(data){
							$scope.newslist = data
				});
		$scope.newsDateHeader = function (index) {
				if ($scope.newslist[index-1] && $scope.newslist[index]){
				return moment($scope.newslist[index-1].date).isSame($scope.newslist[index].date, 'day');
				}
			}
		}
	])
	.controller('mainAdv', ['$scope', '$http', '$sce', function($scope, $http, $sce){
		$scope.widget = {}
			$http.get('/wp-json/wp/v2/widgets')
				.success(function(res){
					for (var i=0; i<res.length; i++){
					if(res[i].title == 'home-page-adv'){
					 		$scope.widget = res[i].text;
					}
				}
			});
			$scope.renderHtml = function(htmlCode) {
				// ------------- count height af adv block -------------------
				var height = $('.main-adv').height()
				$("header").css("top", height +'px')
				$('.site__header').before($('.main-adv'))
				// --------------- process html --------------------
				var htmlCode = String(htmlCode)
				return $sce.trustAsHtml(unescape(htmlCode));
			};
		}
	])
	.controller('singleAdv', ['$scope', '$http', '$sce', '$window', function($scope, $http, $sce, $window){
		}
	])
	.directive('socialSharesDirective', function(WPService) {
	  return {
	    restrict: 'E',
	    scope: {
			post: '='
		},
	    templateUrl: myLocalized.partials + 'partials/social-shares-directive.html',
	    link: function(scope, element){
	    	if (angular.isUndefined(scope.post)){
	    		var url = location.pathname;
	    			url = url.split('/');
	    		var slug = url[url.length-2] // post slug;
	    			WPService.getPostbySlug(slug).then(function(res){
	    				scope.post = res.data[0];
	    				var allshares = document.getElementsByClassName('shareBtn');
					for (var q=0; q<allshares.length; q++){
					    allshares[q].onclick = function() {
					        FB.ui({
					          method: 'share',
					          mobile_iframe: true,
					          display: 'popup',
					          href: $(this).attr('href'),
					          quote: $(this).attr('data_quote'),
					          caption: document.title
					        }, function(response){});
						};
					};
					})
	    	}
	    }
	  };
	})
	.directive('sharesDirective', function(WPService,$location) {
	  return {
	    restrict: 'E',
		scope: {
			url: '=',
			type: '=',
			count: '@'
		},
		template: '{{count}}',
		link: function(scope, element){

			// auto url detect
			var url = location.href;
				url = url.split('//');
				url = url[1];
				scope.count = 0;

			// http://
			var	counthttp = 0,
				counthttps = 0,
				http = 'http://'+url,
				https = 'https://'+url;

			if (element[0].BaseURl != location.href){
				scope.url = element[0].BaseURl;
			}

			if (scope.type == 'facebook'){
				WPService.getFacebookShCount(http).then(function(res){
					if (angular.isUndefined(res.data.share)){
						counthttp = 0;
					} else {
						counthttp = res.data.share.share_count;
					}
					scope.count = Number(scope.count) + Number(counthttp);
				})

				WPService.getFacebookShCount(https).then(function(res){
					if (angular.isUndefined(res.data.share)){
						counthttps = 0;
					} else {
						counthttps = res.data.share.share_count;
					}
					scope.count = Number(scope.count) + Number(counthttps);
				})

			} else if (scope.type == 'vk'){
				WPService.getAllShCount(http).then(function(res){
					if (res){
						var parcecount = res.split(' ');
						    parcecount = parcecount[1].split(')');
						counthttp = Number(parcecount[0])
					}
					scope.count = Number(scope.count) + Number(counthttp);
				})
				WPService.getAllShCount(https).then(function(res){
					if (res){
						var parcecount = res.split(' ');
							parcecount = parcecount[1].split(')');
						counthttps = Number(parcecount[0])
					}
					scope.count = Number(scope.count) + Number(counthttps);
				})
			}
		}}}
	)
	.directive('advDirective', function($window) {
	  return {
	    restrict: 'E',
		scope: {
		},
		template: '<a href="#" ng-click="advtrack(randomimage.label)"><img src="{{randomimage.image}}"></a>',
		link: function(scope){
			scope.randomimage = {};
			var images = [
			{image: "http://reed.media/wp-content/uploads/2016/09/14137801_1042053302576837_1581984993_n.jpg", url :"http://fgf.reed.media/ru", label:"JPG - free generation forum 2016"},
			{image: "http://reed.media/wp-content/uploads/2016/09/14101757_1042053299243504_1586853629_n.gif", url:"http://fgf.reed.media/ru", label:"GIF - free generation forum 2016"}];

			var ry=Math.floor(Math.random()*images.length);

			scope.randomimage = images[ry];

			ga('send', { 			         // notify google about page view
				eventCategory: 'AdvBanner - Show',    // The title of the page (e.g. homepage)
				eventAction : 'show',		     // URL of the page being tracked.
				hitType: 'event',
				eventLabel: scope.randomimage.label           // The path portion of a URL. This value should start with a slash (/) character.
			});

			scope.advtrack = function(title){
				var label = title

				ga('send', { 			         // notify google about page view
				  eventCategory: 'AdvBanner - Click',    // The title of the page (e.g. homepage)
				  eventAction : 'click',		     // URL of the page being tracked.
				  hitType: 'event',
				  eventLabel: label           // The path portion of a URL. This value should start with a slash (/) character.
				});

				$window.open('http://fgf.reed.media/ru')
			}
		}}}
	)
	.directive('newsBarDirective', function() {
	  	return {
	    	restrict: 'E',
	    	templateUrl: myLocalized.partials + 'partials/news-bar.html',
		}
	})
	.service('WPService', ['$http' , '$route', '$timeout' , '$location', function($http, $route,$timeout, $location) {
	allPosts = [];
	var PI = {

		getAllPosts : function() {
			return $http.get('/wp-json/wp/v2/posts?filter[category_name]=news&per_page=10')
					.success(function(data){
					allPosts = data
					});
		},
		getPosts : function(page) {
					return $http.get('/wp-json/wp/v2/posts?filter[category_name]=news&filter[post_status]=publish&filter[posts_per_page]=4&page=' + page + '&filter[orderby]=date&filter[order]=desc')
							.success(function(data){
								allPosts = data
					});
		},
		getPostbySlug : function(slug) {
			return $http.get('/wp-json/wp/v2/posts?filter[name]='+ slug)
							.success(function(res){
			});
		},
		getWidgets : function() {
			return $http.get('/wp-json/wp/v2/widgets')
							.success(function(res){
			});
		},
		getFacebookShCount : function(url){
			return $http.get('https://graph.facebook.com/?id=' + url)
							.success(function(res){
			});
		},
		getAllShCount : function(url){
			return $.get('/sr.php', {'site':'https://vk.com/share.php?act=count&index=1&url=' + url}) //http://donreach.com/social-share-count
							.success(function(res){
			});
		}
	}
	return PI
}]);

angular.module('app', ['ngResource', 'ngRoute', 'ngSanitize', 'angularMoment', 'angular-loading-bar', '720kb.socialshare', 'appMain', 'MailChimpSubscription'])
	.config(['$routeProvider', '$locationProvider', 'cfpLoadingBarProvider', function($routeProvider, $locationProvider, cfpLoadingBarProvider) {
		cfpLoadingBarProvider.includeSpinner = false;
		cfpLoadingBarProvider.includeBar = true;
		cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    	cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Загружаю еще...</div>';

		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});

	}
	])
	.controller('newsCtr', ['$scope',
		'WPService',
		'$location',
		'$route',
		'$routeParams',
		'$anchorScroll',
		'$sce',
		'$http',
		function($scope,
			WPService,
			$location,
			$route,
			$routeParams,
			$anchorScroll,
			$sce,
			$http
			) {
		$scope.data = {};
		$scope.newslist = [];
		$scope.newslistRightBar = [];
		$scope.slugPost = {};
		$scope.slugPostshow = false;
		$scope.page = 0;
		$scope.routeParams = $routeParams;
		$scope.widget = {};
		$scope.prevSlug = '';

		$scope.loadMoreLock = false;
		var lastRoute = $route.current;

		$scope.siteUrl = 'http://' + $location.host();

		$scope.$on('$locationChangeStart', function(){
			var res = $location.url()
			var testsearch = res.split('/') // split by = or &
			if (res == '/'){
				location.replace($location.url())
			} else if (res == '/events/'){
				location.replace($location.url())
			} else if (testsearch[1] == '?p'){      // what is it?
			} else if(testsearch[1] == 'wp-admin'){
				location.replace($location.absUrl())

			}
			//
		});

		function adjust_news_review_height() {
			var _header = $('.site__header').height();
			var _window = $(window).height();
			var _news_reveiw_block = _window - _window/2;
			// $('.sidebar__block .news__review').height(_news_reveiw_block);

		}

		$scope.showEachfifth = function($index){
			var count = ($index+1)/5
			if (Number.isInteger(count)){return true}
		}

		$(document).on('scroll', function() {
			// Waypoint.refreshAll()

			var scroll_pos = $(document).scrollTop(), //real scroll position

			// ------------ bottom colculated position of the scroll ---------------------
			scroll_pos_to_bottom = scroll_pos + $(window).height(),

			last_el_array_id = $scope.newslist.length-1,
			bottom_last_el_slug = '#' + $scope.newslist[last_el_array_id].slug,
			more_pos = $("#loading-bar-container").offset().top + $("#loading-bar-container").outerHeight();

			if (scroll_pos <= 100) {
				$('.feed__sidebar').css({"top": 0 + "px"})
			}else{
				$('.feed__sidebar').css({"top": -80 + "px"})
			}

			for (i = 0; i<$scope.newslist.length; i++){
				var slug = '#'+$scope.newslist[i].slug,
					pos = $(slug).position().top + $(slug).height(),
					classid = '.'+ $scope.newslist[i].slug;
				// --- line-throught items on right bar
				if (scroll_pos <= pos){
					$(classid).removeClass("line-throught");
				}else {
					$(classid).addClass("line-throught");
				}

				if (scroll_pos_to_bottom+45 >= pos-40  && scroll_pos_to_bottom+45 <= pos +40){
					var target = '#location-' + $scope.newslist[i].slug;
			      	$(target).click();
				}
				//---------- add waypoints ----------------------------
			}
		    if(scroll_pos_to_bottom>=more_pos){
		        if (!$scope.loadMoreLock){
		        	loadData();
		        }
		        $scope.loadMoreLock = true; //locking variable - from more then 1 request
		    }
		})

		$scope.newsDateHeader = function (index) {
				if ($scope.newslist[index-1] && $scope.newslist[index]){
					return moment($scope.newslist[index-1].date).isSame($scope.newslist[index].date, 'day');
				}
		}
		$scope.renderHtml = function(htmlCode) {
			var htmlCode = String(htmlCode)
			return $sce.trustAsHtml(unescape(htmlCode));
		};

		var $rootScope = angular.element(document.documentElement).scope(); // because the ng-app attribute is on html element

		window.onresize = function(){
			$rootScope.$broadcast('autoheight-adjust');

		};

		// load new news

		loadData = function () {

			// --------------------- get url ------------------------
			var res = $location.url()
			res = res.split('/')
			//----------------- set page number -----------------------
			$scope.page = $scope.page + 1
			// ------------ , check whether to load additional, requested post -------
			if (res[res.length-2] != 'news'){
				WPService.getPostbySlug(res[res.length-2]).then(function (res) {
					$scope.slugPost = res.data[0];
					$scope.slugPostshow = true;
				})
				WPService.getPosts($scope.page).then(function (res) {
					$scope.newslistRightBar = []
					for (var i=0; i<res.data.length; i++){
						// -----------   check post duplication  ----------
						if($scope.slugPost.id != res.data[i].id){
						 		$scope.newslist.push(res.data[i]);
						 		$scope.newslistRightBar.push(res.data[i])
						} else {
							// $scope.newslistRightBar.unshift(res.data[i])
						}
					}
				adjust_news_review_height();
				$scope.loadMoreLock = false; //unlock next request
				})
			} else{
				WPService.getPosts($scope.page).then(function (res) {

					for (var i=0; i<res.data.length; i++){
						// -----------   check post duplication  ----------
						if($scope.slugPost.id != res.data[i].id){
						 		$scope.newslist.push(res.data[i]);
						}
					}
					$scope.newslistRightBar = res.data;
					adjust_news_review_height();
					$scope.loadMoreLock = false; //unlock next request
				})
			}
			WPService.getWidgets().then(function(res){
				for (var i=0; i<res.data.length; i++){
					if(res.data[i].title == 'news-page-adv'){
					 		$scope.widget = res.data[i].text;
					}
				}
			})
		}

		// ----------------------
		// button to scroll
		// + update link

		// SCROLL TO id
		// ---------------------
		function scrl(slug) {
			var target = '#' + slug
			var adress = $(target).offset().top -100;
			$(window).scrollTo(adress, 2000)
		}

		$scope.pleasescrollTo = function(slug) {
			scrl(slug);
			var target = slug;
			$location.path(target);
		}

		$scope.locationChange = function(post){
			if (post.slug != $scope.prevSlug){     		// filter - not to set the same url few times
				var target = post.slug;
				$location.path(target);				// set new url on adress bar

				$scope.prevSlug = target;

				var loactionGoogle = '/'+target;

				ga('send', { 			         // notify google about page view
				  title: post.title.rendered,    // The title of the page (e.g. homepage)
				  location : post.link,		     // URL of the page being tracked.
				  hitType: 'pageview',
				  page: loactionGoogle           // The path portion of a URL. This value should start with a slash (/) character.
				});
			}
		}

		loadData();
		}
	])
	.directive('newsDirective', function() {
	  return {
	    restrict: 'E',
	    templateUrl: myLocalized.partials + 'partials/news.html',
	  };
	})
	.directive('setWatchers', function(){   //  when  ng-repeat finish to load a DOM
		return function(scope, element, attrs) {
			if (scope.$last){
		      	$('.site__logo').click (function(){location.replace(location.url())})
			}

		};
	})


angular.module('myApp.filters', []).
  filter('htmlToPlaintext', function() {
    return function(text) {
      return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  }
  ).
  filter('href', function() {
    return function(text) {
    	if (text){
    		text = text.split('"')
      	return  text[1]
    	} else {
    		return  ''
    	}

    };
  });


angular.module('MailChimpSubscription', ['ngRoute', 'ngResource', 'ngSanitize'])
.controller('MailchimpSubscriptionCtrl', ['$resource', '$log', '$scope', '$rootScope',
              function ($resource, $log, $scope, $rootScope) {
    // Handle clicks on the form submission.
    $scope.addSubscription = function (mailchimp) {
      var actions,
          MailChimpSubscription,
          params = {},
          url;

      // Create a resource for interacting with the MailChimp API
      url = '//' + mailchimp.username + '.' + mailchimp.dc +
            '.list-manage.com/subscribe/post-json';

      var fields = Object.keys(mailchimp);

      for(var i = 0; i < fields.length; i++) {
        params[fields[i]] = mailchimp[fields[i]];
      }

      params.c = 'JSON_CALLBACK';
      params.language = 'ru';

      actions = {
        'save': {
          method: 'jsonp'
        }
      };
      MailChimpSubscription = $resource(url, params, actions);
      // Send subscriber data to MailChimp
      MailChimpSubscription.save(
        // Successfully sent data to MailChimp.
        function (response) {
          // Define message containers.
          mailchimp.errorMessage = '';
          mailchimp.successMessage = '';

          // Store the result from MailChimp
          mailchimp.result = response.result;

          // Mailchimp returned an error.
          if (response.result === 'error') {
            if (response.msg) {
              // Remove error numbers, if any.
              var errorMessageParts = response.msg.split(' - ');
              if (errorMessageParts.length > 1)
                errorMessageParts.shift(); // Remove the error number
              mailchimp.errorMessage = errorMessageParts.join(' ');
            } else {
              mailchimp.errorMessage = 'Произошла ошибка';
            }
          }
          // MailChimp returns a success.
          else if (response.result === 'success') {

            mailchimp.successMessage = response.msg;
            // mailchimp.successMessage = 'Мы выслали Вам письмо подтверждение.';
          }

          //Broadcast the result for global msgs
          $rootScope.$broadcast('mailchimp-response', response.result, response.msg);
        },

        // Error sending data to MailChimp
        function (error) {
          $log.error('MailChimp Error: %o', error);
        }
      );
    };
  }])
	.directive('maichimpSubscribe', function(){
		return {
			restrict: 'E',
			templateUrl: myLocalized.partials + 'partials/mailchimp-subscribe.html',
		}
});
