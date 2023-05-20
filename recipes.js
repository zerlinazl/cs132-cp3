/**
 * Author: Zerlina Lai
 * CS132 CP3: fetch
 * JS for this project. Search for recipes that use a given ingredient. 
 * User can click into any of the listed results to view cuisine type and ingredient details.
 */

(function(){
    "use strict";

    const FILTER_BASE_URL = "https://themealdb.com/api/json/v1/1/filter.php?i=";
    const ID_BASE_URL = "https://themealdb.com/api/json/v1/1/lookup.php?i=";

    function init() {
        // set up event listeners
        // search button initiates fetch
        id("submit-btn").addEventListener("click", fetchList);
    }

    /**
     * @returns main ingredient searched in search box 
     */
    function getInput() {
        let searchIng = id("search-ing").value;
        let ingredient = searchIng.replaceAll(" ", "_").trim();
        // process into chicken_breast form
        return ingredient;
    }

    /**
     * calls async fetch function with ingredient search url
     */
    function fetchList() {
        // clear all responses
        id("recipe-details").textContent = "";
        id("response").textContent = "Loading food...";
        id("submit-btn").disabled = true; // temporarily disable search button
        let ing = getInput();
        let url = FILTER_BASE_URL + ing;
        getRecipeList(url).then((data) => {
            try {
                processListData(data);
            }
            catch (err) {
                handleRequestError(err);
            }
        })
    }

    /**
     * Gets the list of recipes with the given main ingredient
     * @param {string} url : the url to fetch
     * @returns JSON of data fetched
     */
    async function getRecipeList(url) {
        try {
            let resp = await fetch(url);
            if (!resp.ok) {
                // throw error
                throw new Error("Response not ok");
            }
            let data = await resp.json(); // returns a Promise
            return data;
        } catch (err) {
            handleRequestError(err);
        }
    }

    /**
     * Extract and display data from the list of recipes.
     * @param {JSON} data 
     */
    function processListData(data) {
        id("submit-btn").disabled = false;
        // clear response
        id("response").textContent = "";
        let instr = gen("p");
        instr.textContent = "Select a recipe to see more details.";
        id("recipe-details").appendChild(instr);
        if (!data["meals"]) {
            let noRes = gen("p");
            noRes.textContent = "No results. Try a different search term.";
            id("response").appendChild(noRes);
        }
        else {
            for (let i=0; i<data["meals"].length; i++) {
                let displayR = gen("button");
                displayR.setAttribute("class", "recipe-list-item");
                displayR.setAttribute("id", data["meals"][i]["idMeal"]);
                displayR.textContent = data["meals"][i]["strMeal"];
                id("response").appendChild(displayR);
                
                // put each button  on a new line
                let brb = gen("br");
                id("response").appendChild(brb);

                // add event listeners
                displayR.addEventListener("click", getDetails);
            }
        }
    }

    /**
     * initiate fetch for a specific recipe to get its details
     */
    function getDetails() {
        let recipeID = this.id;
        let url = ID_BASE_URL + recipeID;
        // fetch recipe details
        getRecipeList(url).then((data) => {
            try {
                processDetails(data);
            }
            catch (err) {
                handleRequestError(err);
            }
        })
    }

    /**
     * extract and display the details of a selected recipe
     * @param {JSON} data 
     */
    function processDetails(data) {
        // clear ingredients display
        id("recipe-details").textContent = "";

        // display name of recipe and subheader
        let name = gen("h2");
        name.textContent = data["meals"][0]["strMeal"];
        id("recipe-details").appendChild(name);

        // display cuisine type
        let cuisine = gen("p");
        cuisine.textContent = "Cuisine: " + data["meals"][0]["strArea"];
        id("recipe-details").appendChild(cuisine);

        // display ingredients
        let ingList = gen("p");
        ingList.textContent = "Ingredients: ";
        for (let i=1; i<21; i++) {
            let ing = "strIngredient" + i;
            if (data["meals"][0][ing]) {
                ingList.textContent = ingList.textContent + data["meals"][0][ing] + ", ";
            }
        }
        ingList.textContent = ingList.textContent.slice(0, -2);
        id("recipe-details").appendChild(ingList);
    }

    /**
     * error handling.
     * @param {error} err 
     */
    function handleRequestError(err) {
        let errMsg = gen("p");
        errMsg.textContent = "Error encountered while fetching recipes.";
        id("response").appendChild(errMsg);
    }

    init();
})();