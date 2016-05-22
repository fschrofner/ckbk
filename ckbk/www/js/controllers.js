angular.module('starter.controllers', ['ionic', 'ngCordova'])


    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
	$scope.recipeList = [];
    })

    .controller('BrowseCtrl', function($scope, $location, databaseService, $cordovaSQLite, $ionicPlatform, $ionicActionSheet, $ionicPopup, $ionicHistory){

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
	$scope.photo = {};
	
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
			    $scope.recipe.image_larger = currRow.image_larger;
			    $scope.recipe.image_smaller = currRow.image_smaller;
			    
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


	$scope.photoSelected = function(_files){
	    var file = _files[0];
	    console.log("selected photo: " + file);
	    
	    if (file.type.match(/image.*/)) {
		console.log("file is an image");
		
		var reader = new FileReader();
		reader.onload = function(e) {		   
		    $scope.photoLoaded(e.target.result);
		};
		reader.readAsDataURL(file);
		
	    } else {
		console.log("error: file not an image!");
		//TODO: show error message
	    }
	}

	$scope.photoLoaded = function(_dataurl){
	    var img = document.createElement("img");
	    img.src = _dataurl

	    //preprocess
	    var canvas = document.createElement("canvas");
	    var ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0);

	    //scale
	    var MAX_WIDTH = 800;
	    var MAX_HEIGHT = 600;
	    var width = img.width;
	    var height = img.height;
	    
	    if (width > height) {
		if (width > MAX_WIDTH) {
		    height *= MAX_WIDTH / width;
		    width = MAX_WIDTH;
		}
	    } else {
		if (height > MAX_HEIGHT) {
		    width *= MAX_HEIGHT / height;
		    height = MAX_HEIGHT;
		}
	    }

	    
	    canvas.width = width;
	    canvas.height = height;

	    console.log("calculated width: " + width);
	    console.log("calculated height: " + height);
	    
	    ctx.drawImage(img, 0, 0, width, height);
	    //ctx.createImageData(width, height);
	    
	    var dataurl = canvas.toDataURL("image/png");
	    console.log("data url: " + dataurl);
	    
	    //TODO: save data on disk/into db
	    //TODO: create smaller thumbnail
	    $scope.recipe.image_larger = dataurl;
	    $scope.recipe.image_smaller = dataurl;
	    $scope.$apply();
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
	    $scope.recipe.image_larger = "data:image/gif;base64,R0lGODlhAQABAIAAAP";
	    $scope.recipe.image_smaller = "data:image/gif;base64,R0lGODlhAQABAIAAAP";
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

	    
	    var query = "INSERT OR REPLACE INTO recipes (id, name, category, prep_time, cook_time, flags, persons, ingredients, directions, image_larger, image_smaller) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
	    var recipeParameter = [recipe.id, recipe.name, recipe.category, recipe.prep_time, recipe.cook_time, JSON.stringify(recipe.flags), recipe.persons, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.directions), recipe.image_larger, recipe.image_smaller];

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


