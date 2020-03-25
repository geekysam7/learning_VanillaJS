import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';
/* global state of the app
 - search object
 - current recipe object
 - shopping list object
 - liked recipes
*/

const state = {};

// Search Controller-------------

const controlSearch = async () => {
    // 1) get query from view
    const query = searchView.getInput();
    console.log(query);

    if(query) {
        // 2) new search object and add to state.
        state.search = new Search(query);

        // 3) prepare UI for results.
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes.
            await state.search.getResult();

            // 5) render results on UI.
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something not right!');
            clearLoader();            
        }
    }
}


elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); //prevents reloading of the page.
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {

    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage);
    }
});

// Recipe Controller ---------------

const controlRecipe = async () => {
    // Get ID from url.
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes.
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected item.
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object.
        state.recipe = new Recipe(id);

        try {
            // Get recipe object and parse ingredients.
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // Calculate servings and time.
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            // Render recipe.
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
        }
        
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//adding load event so that we do not loose data in case of bookmark.

const controlList = () => {
    // Create a new list if there is not yet.
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI.
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addition(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

elements.shopping.addEventListener('click', e=> {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handling the delete button.
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);

    }
    //handling count update
     else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});

//LIKE Controller::::::::

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;
    
    // User has not yet liked current recipe.
    if (!state.likes.isLiked(currentId)) {
        //Add
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Toggle the like button
        likesView.toggleLikeBtn(true);
        //Add like to the UI list.
        likesView.renderLike(newLike);
    // User has liked the current recipe.
    } else {
        //remove
        state.likes.deleteLike(currentId);
        //Toggle the like button
        likesView.toggleLikeBtn(false);
        //remove like to the UI list.
        likesView.deleteLike(currentId);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


// Restore liked recipes on page loads.

window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes.
    state.likes.readStorage();
 
    // Toggle like menu button.
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes.
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// handling recipe button clicks::::

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease is clicked.
        if (state.recipe.servings > 1) {

            state.recipe.updateServings('dec');   
            recipeView.updateServingsIngredients(state.recipe);      
        
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Decrease is clicked.
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);      

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        // Like controller 
        controlLike();
    }
});