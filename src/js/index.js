import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, clearLoader,renderLoader} from './views/base';


/**
 * - Search object
 * - Current recipe object 
 * - Shopping list object
 * - Liked recipes
 */


const state = {};

/**
 * SEARCH CONTROLLER
 */
const search =new Search('pizza');
search.getResults();

const controlSearch = async () => {
    // 1) Get the query from view
    const query = searchView.getInput();
    if (query) {
        // 2) New search object and add to global state object 
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{
            // 4) Searchh for Recipes
            await state.search.getResults();
    
            // 5) Render query to view
            clearLoader();
            searchView.renderResults(state.search.result);          
            //removeLoader(elements.searchRes);
        }
        catch(error) {
            alert('Error performing the search');
        }
        clearLoader();
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    }

});


/**
 * RECIPE CONTROLLER
 */
const controlRecipe =async () => {
    // Get ID from the URL

    const id = window.location.hash.replace('#', '');
    //console.log(id);
    if(id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight Selected
        if(state.search)searchView.highlightSelected(id);

        // Create new recipe object 
        state.recipe = new Recipe(id);

        try{
            // Get recipe data and parse Ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // Calculate servings and time 

            state.recipe.calcServings();
            state.recipe.calcTime();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes ? state.likes.isLiked(id) : false
                );
        }
        catch(error) {
            console.log(error);
            alert('Error processing recipe :(');
        }
    }
    
};


['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));



/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new List if there is none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list  and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}



// Handle events for deleting and updating the list
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // Handle the delete item 
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
    // Delete from state
    state.list.deleteItem(id);

    // Delete from UI
    listView.deleteItem(id);
    }
    else if(e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value,10);
        if(val > 0) {
            state.list.updateCount(id,val);
        }
    }
});



/**
 * * LIKE CONTROLLER
 */
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id; 

    // User has not currently liked the current recipe
    if(!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img

        );
        // Toggle like the button
        likesView.toggleLikeBtn(true);

        // Add recipe to the UI list
        likesView.renderLike(newLike);
    }
    // User has not currently liked the current recipe
    else {
        // Remove like from the list 
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove the UI list
        likesView.deleteLike(currentID);        
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


// Restore like on Page load from local storage
window.addEventListener('load',() => {
    // Create new Likes  in the state 
    state.likes = new Likes();

    // Restore Likes 
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the likes on the like menu 
    state.likes.likes.forEach(like => likesView.renderLike(like));

});


// Handling serving events
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 0){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if(e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to the list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')) {
        // Like Controller
        controlLike();
    }
    
});
