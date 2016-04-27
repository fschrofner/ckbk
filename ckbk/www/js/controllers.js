angular.module('starter.controllers', ['ionic', 'ngCordova'])


    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
	$scope.recipeList = [];
    })

    .controller('BrowseCtrl', function($scope, $location, databaseService, $cordovaSQLite, $ionicPlatform, $ionicActionSheet, $ionicPopup){

	$scope.loadRecipes = function(){

	    //create test data for now, use database later on
	    var currRecipe = {};
	    currRecipe.id = 1;
	    currRecipe.name = "Lasagna";
	    currRecipe.category =  "Lunch";
	    currRecipe.prep_time = 30;
	    currRecipe.cook_time = 60;
	    
	    currRecipe.flags =  [
		{ text: "Vegan", checked: true },
		{ text: "Vegetarian", checked: false },
		{ text: "Glutenfree", checked: false }
	    ];
	    
	    currRecipe.ingredients =  [
		{ingredient: "Beef", amount: "500g"}
	    ];
	    
	    currRecipe.directions = [{text:"Put beef in there! Hell yeah this is going to be vegan!"}];

	    $scope.recipeList.push(currRecipe);
	};

	$scope.showOverflowMenu = function(currRecipe) {
	    console.log("long pressed: " + currRecipe.name);

	    //show overflow menu
	    $ionicActionSheet.show({
		titleText: currRecipe.name,
		buttons: [
		    { text: 'Edit <i class="icon ion-edit"></i>'}
		],
		destructiveText: 'Delete <i class="icon ion-trash-a"></i>',
		cancelText: 'Cancel',
		cancel: function() {
		    console.log('CANCELLED');
		},
		buttonClicked: function(index) {
		    console.log('BUTTON CLICKED', index);
		    switch(index){
		    case 0:
			//edit
			console.log("edit pressed, id: " + currRecipe.id);
			window.location.href='#/app/recipes/' + currRecipe.id;
			break;
		    }
		    return true;
		},
		destructiveButtonClicked: function() {
		    $scope.confirmDeletion(currRecipe);
		    return true;
		}
	    });
 	}
	
	$ionicPlatform.ready(function() {
	    console.log("platform ready");
	    $scope.loadRecipes();
	});
    });

