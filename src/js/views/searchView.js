import {elements} from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });

    const el = document.querySelector(`.results__link[href*="${id}"]`);
    if(el) {
        el.classList.add('results__link--active');
    }
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const limitRecipeTitle = (title, limit =17) => {
    const newTitle = [];
    if(title.length > limit){
        title.split(' ').reduce((acc, cur) => {
            if(acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;;
        }, 0);


        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

const renderRecipe = recipe => {
    const markup  = `
        <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

const createButtons = (page, type)  => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let button;
    if(page === 1 && pages > 1) {
        // Create only next page button
        button = createButtons(page, 'next');
    }
    else if(page < pages) {
        // Create boh next and prev buttons
        button = `
        ${createButtons(page, 'prev')} 
        ${createButtons(page, 'next')}
        `;
    }
    else if(page === pages && pages > 1) {
        // Create only prev button
        button = createButtons(page, 'prev');
    }
    elements.searchResPages.insertAdjacentHTML('beforeend', button);
}

export const renderResults = (recipe, page  = 1, resPerPage = 10) => {
    const start = (page -1) * resPerPage;
    const end = page * resPerPage;
    recipe.slice(start, end).forEach(renderRecipe);
    renderButtons(page, recipe.length, resPerPage);
};