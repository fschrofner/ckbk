angular.module('starter.controllers', ['ionic', 'ngCordova'])


    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
	$scope.recipeList = [];
    })

    .controller('BrowseCtrl', function($scope, $location, databaseService, $cordovaSQLite, $cordovaFile, $ionicPlatform, $ionicActionSheet, $ionicPopup, $ionicHistory, $http){
	$scope.filterFlags = {};

	$scope.resetFilter = function() {
	    $scope.filterFlags.baking = false;
	    $scope.filterFlags.drinks = false;
	    $scope.filterFlags.breakfast = false;
	    $scope.filterFlags.lunch = false;
	    $scope.filterFlags.dinner = false;
		$scope.filterFlags.vegetarian=false;
		$scope.filterFlags.vegan=false;
		$scope.filterFlags.glutenfree=false;
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
				currRecipe.rating = currRow.rating;
				
				currRecipe.flags = JSON.parse(currRow.flags);
				currRecipe.persons = currRow.persons;
				currRecipe.ingredients = JSON.parse(currRow.ingredients);
				currRecipe.directions = JSON.parse(currRow.directions);

				currRecipe.image_larger = currRow.image_larger;
				currRecipe.image_smaller = currRow.image_smaller;
				
				$scope.recipeList.push(currRecipe);
			    }
			}
			$scope.$apply();
		    },
		    function(error){

		    }
		);
	}

	$scope.searchParametersChanged = function() {
	    var db = databaseService.getDatabase();
	    $scope.recipeList.splice(0,$scope.recipeList.length);
	    //$scope.recipeList.length = 0;
		
		var searchCategories = {};
		var idx = 0;
		
		if ($scope.filterFlags.baking ==true) {
			searchCategories[idx]="Baking";
			idx++;
		}
		
		if ($scope.filterFlags.drinks ==true) {
			searchCategories[idx]="Drinks";
			idx++;
		}
		
		if ($scope.filterFlags.breakfast ==true) {
			searchCategories[idx]="Breakfast";
			idx++;
		}
		
		if ($scope.filterFlags.lunch ==true) {
			searchCategories[idx]="Lunch";
			idx++;
		}
		
		if ($scope.filterFlags.dinner ==true) {
			searchCategories[idx]="Dinner";
			idx++;
		}
		
		var sqlStatement = "SELECT * FROM recipes WHERE "
		
		
		if (idx>0) {
		sqlStatement+= "category='" + searchCategories[0] + "'";
		for(var i = 1; i < idx; i++) {
				sqlStatement+=" OR category='" + searchCategories[i] + "'";
		}
		}
		
		sqlStatement += " ORDER BY name";
		
	    
		//nothing selected, show all
		if ($scope.filterFlags.baking == false && $scope.filterFlags.drinks == false && $scope.filterFlags.breakfast == false && $scope.filterFlags.lunch == false && $scope.filterFlags.dinner == false) {
			sqlStatement="SELECT * FROM recipes ORDER BY name";
		}
		
		var searchFlags = {};
		var flagIdx = 0;
		if ($scope.filterFlags.vegan ==true) {
			searchFlags[flagIdx]="Vegan";
			flagIdx++;
		}
		if ($scope.filterFlags.vegetarian ==true) {
			searchFlags[flagIdx]="Vegetarian";
			flagIdx++;
		}
		if ($scope.filterFlags.glutenfree ==true) {
			searchFlags[flagIdx]="Glutenfree";
			flagIdx++;
		}
		
	    $cordovaSQLite.execute(db, sqlStatement)
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
					
					if (checkRecipeForSearchText($scope.search, currRecipe.name) == true && (($scope.filterFlags.vegan==false && $scope.filterFlags.vegetarian==false  && $scope.filterFlags.glutenfree==false) || checkRecipeForFlags(searchFlags, flagIdx, currRecipe.flags)==true)) { 
						$scope.recipeList.push(currRecipe);
					}				
				}
			}
						
			$scope.$apply();
		    },
		    function(error){

		    }
		);
	}
	
	checkRecipeForSearchText = function(searchText, recipeName) {
	
		searchText = searchText.toLowerCase();
		recipeName = recipeName.toLowerCase();
		
		var namesMatch = true;
	
		if (searchText.length<recipeName.length) {
			for(var i = 0; i < searchText.length; i++) {
				if (searchText[i] != recipeName[i]) {
					namesMatch=false;
				}	
			}
		} else {
			for(var i = 0; i < recipeName.length; i++) {
				if (searchText[i] != recipeName[i]) {
					namesMatch=false;
				}	
			}
		}
		
		return namesMatch;
	}
	
	checkRecipeForFlags = function(filterFlags, filterFlagsSize, recipeFlags){
		console.log("Checked Flags Size = " + filterFlagsSize);
		for(var i = 0; i < filterFlagsSize; i++) {
			var flagFulfilled = false;
			for(var j = 0; j < 3; j++){
				console.log("filterFlag: " + filterFlags[i] );
				console.log("RecipeFlag: " + recipeFlags[j].text + " : " +  recipeFlags[j].checked);
				if(filterFlags[i] == recipeFlags[j].text && recipeFlags[j].checked==true){
					flagFulfilled = true;
				}
			}
			if(flagFulfilled == false){
				return false;
			}
		}
		return true;
	}

	$scope.showOverflowMenu = function(currRecipe) {
	    console.log("long pressed: " + currRecipe.name);

	    //show overflow menu
	    $ionicActionSheet.show({
		titleText: currRecipe.name,
		buttons: [
		    { text: 'Edit <i class="icon ion-edit"></i>'},
			{ text: 'Export <i class="icon ion-ios-download"></i>'}
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
			case 1:
			console.log("export pressed, id: " + currRecipe.id);
			$scope.saveToFile(currRecipe.name + "_recipe.json", angular.toJson(currRecipe));
		    }
		    return true;
		},
		destructiveButtonClicked: function() {
		    $scope.confirmDeletion(currRecipe);
		    return true;
		}
	    });
 	}
	
	$scope.saveToFile = function(_filename, _json){
	    $cordovaFile.writeFile(cordova.file.externalDataDirectory, _filename, _json)
		.then(function (success) {
		    // success
			//TODO: add dialog
		    console.log("export success");
		    $scope.$apply();
		}, function (error) {
		    // error
		    console.log("export error");
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
	
	$scope.importRecipe = function(){
	    console.log('import');
		fileChooser.open(function(uri) {
			console.log("success filechooser");
			
			if (uri.indexOf("_recipe.json") < 0) {
				alert("This is not a recipe. Please choose another file.");
			} else {
				var serviceUrl = uri;
				$http.get(serviceUrl).success(function (recipe) {
					console.log(angular.toJson(recipe));
					
					$scope.recipeList.push(recipe)
					
					var id = Date.now() + Math.floor((Math.random() * 100) + 1);

					var query = "INSERT OR REPLACE INTO recipes (id, name, category, prep_time, cook_time, rating, flags, persons, ingredients, directions, image_larger, image_smaller) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
					var recipeParameter = [id, recipe.name, recipe.category, recipe.prep_time, recipe.cook_time, recipe.rating, JSON.stringify(recipe.flags), recipe.persons, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.directions), "", ""];

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
					
					
				});
			}
			
		}, function() {
			console.log("failure filechooser");
		});
	}
	
    })

    .controller('RecipeCtrl', function($scope, $location, $stateParams, $state, $cordovaSQLite, $cordovaFile, databaseService, $ionicPopup, $ionicLoading, $ionicPlatform, $ionicHistory) {
	$scope.recipe = {};
	$scope.photo = {};
	$scope.oldPhotos = [];
	
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
				$scope.recipe.rating = currRow.rating;
			    
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
		$scope.showLoadingAnimation(true);
		
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

	$scope.showLoadingAnimation = function(_show){
	    //TODO: do nothing for now, it does seem to block some stuff
	    return;
	    if(_show){
		console.log("show loading animation..");
		// Show the loading overlay and text
		$scope.loading = $ionicLoading.show();
	    } else {
		console.log("stop loading animation");
		$ionicLoading.hide()
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
	    
	    $scope.oldPhotos.push($scope.recipe.image_larger);
	    $scope.oldPhotos.push($scope.recipe.image_smaller);
	    

	    // write to file system
	    var currentTime = Date.now();
	    canvas.toBlob(function(_blob){
		$scope.saveToFile(currentTime + ".png", _blob, false);
	    });

	    //create thumbnail
	    MAX_WIDTH = 200;
	    MAX_HEIGHT = 150;
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

	    console.log("calculated thumb width: " + width);
	    console.log("calculated thumb height: " + height);
	    
	    ctx.drawImage(img, 0, 0, width, height);

	    canvas.toBlob(function(_blob){
		$scope.saveToFile(currentTime + "_thumb.png", _blob, true);
	    });
	}

	$scope.saveToFile = function(_filename, _blob, _thumb){
	    $cordovaFile.writeFile(cordova.file.applicationStorageDirectory, _filename, _blob, true)
		.then(function (success) {
		    // success
		    console.log("file write success");
		    if(_thumb){
			$scope.recipe.image_smaller = cordova.file.applicationStorageDirectory + _filename;
			console.log("thumbnail saved: " + $scope.recipe.image_smaller);
			$scope.showLoadingAnimation(false);
		    } else {
			$scope.recipe.image_larger = cordova.file.applicationStorageDirectory + _filename;
			console.log("larger image saved: " + $scope.recipe.image_larger);
		    }
		    
		    $scope.$apply();
		}, function (error) {
		    // error
		    console.log("file write error");
		});
	}

	$scope.deletePhotos = function(_photos){
	    for (var index in _photos){
		if(_photos[index] != null && _photos[index] != ""){
		    var filename = _photos[index].replace(/^.*[\\\/]/, '');
		    if($cordovaFile.checkFile(cordova.file.applicationStorageDirectory, filename)){
			$cordovaFile.removeFile(cordova.file.applicationStorageDirectory, filename).
			    then(function(success){
				console.log("file delete success");
			    }, function(error){
				console.log("file delete error");
			    });
		    }
		}
	    }
	}
	
	$scope.loadDefaultValues = function(_id){
	    $scope.recipe.id = _id;
	    $scope.recipe.name = "";
	    $scope.recipe.category = "Lunch";
	    $scope.recipe.prep_time = 0;
	    $scope.recipe.cook_time = 0;
		$scope.recipe.rating = 3;
	    
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
	    $scope.recipe.image_larger = "";
	    $scope.recipe.image_smaller = "";
	}
	
	$scope.ratingButtonClicked =function(n) {
		$scope.recipe.rating = n;
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

	$scope.saveRecipe = function(){
	    //delete all old converted photos
	    $scope.deletePhotos($scope.oldPhotos);
	    
	    //save recipe, then go to browse state
	    var recipe = angular.copy($scope.recipe);

	    //remove old recipe from list
	    for (var i = 0; i < $scope.recipeList.length; i++) {
		if($scope.recipeList[i].id == recipe.id){
		    $scope.recipeList.splice(i, 1);
		}
	    }
	    
	    $scope.recipeList.push(recipe)

	    var query = "INSERT OR REPLACE INTO recipes (id, name, category, prep_time, cook_time, rating, flags, persons, ingredients, directions, image_larger, image_smaller) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
	    var recipeParameter = [recipe.id, recipe.name, recipe.category, recipe.prep_time, recipe.cook_time, recipe.rating, JSON.stringify(recipe.flags), recipe.persons, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.directions), recipe.image_larger, recipe.image_smaller];

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
	}

	//when the view is ready, load the picture
	$ionicPlatform.ready(function() {
	    console.log("platform ready");
	});
	
});


