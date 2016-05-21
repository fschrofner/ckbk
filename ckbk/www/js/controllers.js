angular.module('starter.controllers', ['ionic', 'ngCordova'])


    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
	$scope.recipeList = [];
    })

    .controller('BrowseCtrl', function($scope, $location, databaseService, $cordovaSQLite, $ionicPlatform, $ionicActionSheet, $ionicPopup, $ionicHistory){
	$scope.filterFlags = {};

	$scope.resetFilter = function() {
	    $scope.filterFlags.baking = false;
	    $scope.filterFlags.drinks = false;
	    $scope.filterFlags.breakfast = false;
	    $scope.filterFlags.lunch = false;
	    $scope.filterFlags.dinner = false;
	}
	
	$scope.loadRecipes = function() {
	    var db = databaseService.getDatabase();
	    $scope.recipeList.splice(0,$scope.recipeList.length);
	    //$scope.recipeList.length = 0;
	    
	    $cordovaSQLite.execute(db, "SELECT * FROM recipes ORDER BY name")
		.then(
		    function(result){
			console.log("number of recipes saved in database: " + result.rows.length);
			if(result.rows.length > 0) {
			    for(i=0;i<result.rows.length;i++){
				var currRow = result.rows.item(i);
				var currRecipe = {};
				
				currRecipe.id = currRow.id;
				currRecipe.name = currRow.name;
				currRecipe.category = currRow.category;
				currRecipe.prep_time = currRow.prep_time;
				currRecipe.cook_time = currRow.cook_time;
				
				currRecipe.flags = JSON.parse(currRow.flags);
				currRecipe.persons = currRow.persons;
				currRecipe.ingredients = JSON.parse(currRow.ingredients);
				currRecipe.directions = JSON.parse(currRow.directions);

				$scope.recipeList.push(currRecipe);
			    }
			}
			$scope.$apply();
		    },
		    function(error){

		    }
		);
	}
	
	// $scope.$watch('[lunchChecked,bakingChecked,drinksChecked,breakfastChecked,dinnerChecked]', function(){
	// 	console.log("Test - watch");
	// }, true );
	
	$scope.searchParametersChanged = function() {
	    var db = databaseService.getDatabase();
	    $scope.recipeList.splice(0,$scope.recipeList.length);
	    //$scope.recipeList.length = 0;
		
	    console.log("Baking: " + $scope.filterFlags.baking);
	    console.log("Drinks: " + $scope.filterFlags.drinks);
	    console.log("Breakfast: " + $scope.filterFlags.breakfast);
	    console.log("Lunch: " + $scope.filterFlags.lunch);
	    console.log("Dinner: " + $scope.filterFlags.dinner);
	    
	    $cordovaSQLite.execute(db, "SELECT * FROM recipes ORDER BY name")
		.then(
		    function(result){
			console.log("number of recipes saved in database: " + result.rows.length);
			if(result.rows.length > 0) {
			    for(i=0;i<result.rows.length;i++){
				var currRow = result.rows.item(i);
				var currRecipe = {};
				
				currRecipe.id = currRow.id;
				currRecipe.name = currRow.name;
				currRecipe.category = currRow.category;
				currRecipe.prep_time = currRow.prep_time;
				currRecipe.cook_time = currRow.cook_time;
				
				currRecipe.flags = JSON.parse(currRow.flags);
				currRecipe.persons = currRow.persons;
				currRecipe.ingredients = JSON.parse(currRow.ingredients);
				currRecipe.directions = JSON.parse(currRow.directions);

				$scope.recipeList.push(currRecipe);
			    }
			}
			$scope.$apply();
		    },
		    function(error){

		    }
		);
	}

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
	    $scope.resetFilter();
	    $scope.loadRecipes();
	});

	$scope.showRecipe = function(currRecipe){
	    window.location.href='#/app/view/recipes/' + currRecipe.id;
	}

	$scope.confirmDeletion = function(currRecipe) {
	    console.log('confirm deletion called');
	    
	    var confirmPopup = $ionicPopup.confirm({
		title: 'Delete recipe?',
		template: 'Are you sure you want to permanently delete this recipe?'
	    });

	    confirmPopup.then(function(res) {
		if(res) {
		    $scope.deleteRecipe(currRecipe);
		} else {
		    console.log('Cancelled');
		}
	    });
	};

	$scope.deleteRecipe = function(currRecipe){
	    var db = databaseService.getDatabase()
	    $cordovaSQLite.execute(db, "DELETE FROM recipes WHERE id=?", [currRecipe.id]).then(function(result){
		$scope.loadRecipes();
	    });
	}
    })

    .controller('RecipeCtrl', function($scope, $location, $stateParams, $state, $cordovaSQLite, databaseService, $ionicPopup, $ionicPlatform, $ionicHistory) {
	$scope.recipe = {};
	
	$scope.loadRecipe = function(){
	    var db = databaseService.getDatabase();
	    console.log("loading recipe: " + $stateParams.recipeId)
	    
	    $cordovaSQLite.execute(db, "SELECT * FROM recipes WHERE id=?", [$stateParams.recipeId])
		.then(
		    function(result){
			if(result.rows.length > 0) {
			    var currRow = result.rows.item(0);

			    //create recipe object to work with
			    $scope.recipe.id = currRow.id;
			    $scope.recipe.name = currRow.name;
			    $scope.recipe.category = currRow.category;
			    $scope.recipe.prep_time = currRow.prep_time;
			    $scope.recipe.cook_time = currRow.cook_time;
			    
			    $scope.recipe.flags = JSON.parse(currRow.flags);
			    $scope.recipe.persons = currRow.persons;			    
			    $scope.recipe.ingredients = JSON.parse(currRow.ingredients);
			    $scope.recipe.directions = JSON.parse(currRow.directions);
			    $scope.recipe.image_source = currRow.image_source;
			    
			} else {
			    console.log("ELSE: recipe not found in database, loading default values");
			    $scope.loadDefaultValues($stateParams.recipeId);
			}
		    },
		    function(error){
			console.log("ERROR: recipe not found in database, loading default values");
			$scope.loadDefaultValues($stateParams.recipeId);
		    }
		);
	}

	$scope.editRecipe = function(){
	    window.location.href='#/app/recipes/' + $scope.recipe.id;
	}

	$scope.loadDefaultValues = function(_id){
	    $scope.recipe.id = _id;
	    $scope.recipe.name = "";
	    $scope.recipe.category = "Lunch";
	    $scope.recipe.prep_time = 0;
	    $scope.recipe.cook_time = 0;
	    
	    $scope.recipe.flags = [
		{ text: "Vegan", checked: false },
		{ text: "Vegetarian", checked: false },
		{ text: "Glutenfree", checked: false }
	    ];

	    $scope.recipe.persons = 4;

	    $scope.recipe.ingredients =  [
		{ingredient: "", amount: "", unit: "g"}
	    ];
	    
	    $scope.recipe.directions = [{text:""}];
	    $scope.recipe.image_source = "https://farm6.staticflickr.com/5131/5413268570_f85d9fd78d_m_d.jpg";
	}
	
	$scope.decreasePersonCount =function() {
		for(var i = 0; i < $scope.recipe.ingredients.length; i++) {
			$scope.recipe.ingredients[i].amount=($scope.recipe.ingredients[i].amount/$scope.recipe.persons)*($scope.recipe.persons-1);	
		}
		$scope.recipe.persons=$scope.recipe.persons-1;
	}
	
	$scope.increasePersonCount =function() {
		for(var i = 0; i < $scope.recipe.ingredients.length; i++) {
			$scope.recipe.ingredients[i].amount=($scope.recipe.ingredients[i].amount/$scope.recipe.persons)*($scope.recipe.persons+1);	
		}
		$scope.recipe.persons=$scope.recipe.persons+1;
	}
	


	//call the load recipe method, when controller is started
	$scope.loadRecipe();
	
	$scope.addIngredientField = function() {
	    $scope.recipe.ingredients.push({ingredient:"",amount:"", unit:"g"});
	    $scope.$apply();
	}

	$scope.removeIngredientField = function(_index){
	    $scope.recipe.ingredients.splice(_index, 1);
	    $scope.apply();
	}

	$scope.addDirectionField = function() {
	    $scope.recipe.directions.push({text:""});
	    $scope.$apply();
	}

	$scope.removeDirectionField = function(_index){
	    $scope.recipe.directions.splice(_index, 1);
	    $scope.apply();
	}
	
	$scope.loadPhoto = function(){
	    //TODO
	}

	$scope.saveRecipe = function(){
	    //save recipe, then go to browse state
	    var recipe = angular.copy($scope.recipe);

	    //remove old recipe from list
	    for (var i = 0; i < $scope.recipeList.length; i++) {
		if($scope.recipeList[i].id == recipe.id){
		    $scope.recipeList.splice(i, 1);
		}
	    }
	    
	    $scope.recipeList.push(recipe)

	    
	    var query = "INSERT OR REPLACE INTO recipes (id, name, category, prep_time, cook_time, flags, persons, ingredients, directions, image_source) VALUES (?,?,?,?,?,?,?,?,?,?)";
	    var recipeParameter = [recipe.id, recipe.name, recipe.category, recipe.prep_time, recipe.cook_time, JSON.stringify(recipe.flags), recipe.persons, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.directions), recipe.image_source];

	    var db = databaseService.getDatabase()
	    
	    console.log("recipe name: " + recipe.name);
	    
	    if(db){
		console.log("database not null");
	    } else {
		console.log("database null");
	    }
	    
            $cordovaSQLite.execute(db, query, recipeParameter).then(function(res) {
	    	console.log("INSERT ID -> " + res.insertId);
            }, function (err) {
	    	console.error(err);
            });

	    $ionicHistory.nextViewOptions({
		historyRoot: true
	    })
	    
	    $ionicHistory.clearCache().then(function(){ $state.go('app.browse') });
	    //$scope.$apply();
	}

	//when the view is ready, load the picture
	$ionicPlatform.ready(function() {
	    console.log("platform ready");
	    //$scope.loadPhoto();
	});

	//$scope.toShow=true;
	
});


