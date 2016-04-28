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

	    currRecipe.persons = 4;
	    
	    currRecipe.ingredients =  [
		{ingredient: "Beef", amount: "500", unit: "g"}
	    ];
	    
	    currRecipe.directions = [{text:"Put beef in there! Hell yeah this is going to be vegan!"}];
	    
	    currRecipe.imageSource = "https://farm6.staticflickr.com/5131/5413268570_f85d9fd78d_m_d.jpg";

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

	$scope.showRecipe = function(currRecipe){
	    window.location.href='#/app/view/recipes/' + currRecipe.id;
	}
    })

    .controller('RecipeCtrl', function($scope, $stateParams, $state, $cordovaSQLite, databaseService, $ionicPopup, $ionicPlatform, $ionicHistory) {
	$scope.recipe = {};
	
	$scope.loadRecipe = function(){
	    //todo load real values here, when a real recipe is opened
	    $scope.loadDefaultValues($stateParams.recipeId);
	}

	$scope.loadDefaultValues = function(_id){
	    $scope.recipe.id = _id;
	    $scope.recipe.name = "Lasagna";
	    $scope.recipe.category = "Lunch";
	    $scope.recipe.prep_time = 30;
	    $scope.recipe.cook_time = 60;
	    
	    $scope.recipe.flags = [
		{ text: "Vegan", checked: true },
		{ text: "Vegetarian", checked: true },
		{ text: "Glutenfree", checked: false }
	    ];

	    $scope.recipe.persons = 4;

	    $scope.recipe.ingredients =  [
		{ingredient: "Beef", amount: "500", unit: "g"}
	    ];
	    
	    $scope.recipe.directions = [{text:"Put beef in there! Hell yeah this is going to be vegan!"}];
	    $scope.recipe.imageSource = "https://c2.staticflickr.com/6/5131/5413268570_f85d9fd78d_b.jpg";
	    // $scope.recipe.ingredients = [
	    // 	{ingredient: "", amount: ""}
	    // ];
	    
	    // $scope.recipe.directions = [{text:""}];
	}

	//call the load recipe method, when controller is started
	$scope.loadRecipe();
	
	$scope.addIngredientField = function() {
	    $scope.recipe.ingredients.push({ingredient:"",amount:""});
	    $scope.$apply();
	}

	$scope.addDirectionField = function() {
	    $scope.recipe.directions.push({text:""});
	    $scope.$apply();
	}

	$scope.loadPhoto = function(){
	    //TODO
	}

	$scope.saveRecipe = function(){
	    //save recipe, then go to browse state
	    $state.go('app.browse');
	}

	//when the view is ready, load the picture
	$ionicPlatform.ready(function() {
	    console.log("platform ready");
	    $scope.loadPhoto();
	});

	$scope.toShow=true;
	
});


