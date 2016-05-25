// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js



angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers'])

    .run(function($ionicPlatform, $cordovaSQLite) {
	$ionicPlatform.ready(function() {
	    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
	    // for form inputs)
	    // if (window.cordova && window.cordova.plugins.Keyboard) {
	    // 	cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	    // 	cordova.plugins.Keyboard.disableScroll(true);
	    // }
	    if (window.StatusBar) {
		// org.apache.cordova.statusbar required
		StatusBar.styleDefault();
	    }

	    
	    //$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS recipe (name text primary key)");
	});
    })


    .service('databaseService', function ($cordovaSQLite) {
	//sqlite access
	var db = null;
	
        return {
            getDatabase: function () {
		console.log("get database called");
		if(db){
		    console.log("database is not null!");
		} else {
		    db = $cordovaSQLite.openDB("recipes.db");
		    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS recipes (id integer primary key, name text, category text, prep_time integer, cook_time integer, rating integer, flags text, persons integer, ingredients text, directions text, image_source text)");
		    console.log("database is null!");
		}
                return db;
            },
	    setDatabase: function(value){
		db = value;
	    }
        };
    })

    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.navBar.alignTitle('center');
	
	$stateProvider

	    .state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	    })

	    .state('app.browse', {
		url: '/browse',
		views: {
		    'menuContent': {
			templateUrl: 'templates/browse.html',
			controller: 'BrowseCtrl'
		    }
		}
	    })
	
	    .state('app.search', {
		url: '/search',
		views: {
		    'menuContent': {
			templateUrl: 'templates/search.html'
		    }
		}
	    })

	    .state('app.settings', {
		url: '/settings',
		views: {
		    'menuContent': {
			templateUrl: 'templates/settings.html'
		    }
		}
	    })

	    .state('app.recipeview', {
		url: '/view/recipes/:recipeId',
		views: {
		    'menuContent': {
			templateUrl: 'templates/recipeview.html',
			controller: 'RecipeCtrl'
		    }
		}
	    })

	    .state('app.single', {
		url: '/recipes/:recipeId',
		views: {
		    'menuContent': {
			templateUrl: 'templates/recipe.html',
			controller: 'RecipeCtrl'
		    }
		}
	    });
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/browse');
    });
