  const searchBox = document.getElementById("searchBox");
      
  const searchBtn = document.getElementById("searchBtn");
  
  const favoritesBtn = document.getElementById("favoritesBtn");
  
  const errorMsg = document.getElementById("errorMsg");
  
  const errorMsg2 = document.getElementById("errorMsg2");
  
  const errorMsg3 = document.getElementById("errorMsg3");

const errorMsg4 = document.getElementById("errorMsg4");
      
  const searchResults = document.getElementById("searchResults");
    
  const recipeDetail = document.getElementById("recipeDetail");
  
  const favoritesResults = document.
  getElementById("favoritesResults");
  
  async function showRecipeDetails(id) {
    try {
      const fullDetail = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    const response = await fetch(fullDetail);
    const detailData = await response.json();
    const meal = detailData.meals[0];
  
    let ingredientsHTML = "";
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal["strIngredient" + i];
      const measure = meal["strMeasure" + i];
      if (!ingredient) continue;
      ingredientsHTML += `<li>${ingredient} - ${measure}</li>`;
    }
  
    const formatedInstructions = meal.strInstructions
      .replace(/[\r\n]/g, "<br>")
      .replace(new RegExp(String.fromCharCode(9634), "g"), "");
  
    let yotubeHTML = "";
    if (meal.strYoutube) {
      yotubeHTML = `<a href="${meal.strYoutube}">Watch on Youtube</a>`;
    }

      const area = meal.strArea ? ` - ${meal.strArea}` : "";
  
    recipeDetail.innerHTML = `
      <h2>${meal.strMeal}</h2>
      <img src="${meal.strMealThumb}">
      <p>${meal.strCategory}${area}</p>
      <ul>${ingredientsHTML}</ul>
      <p>${formatedInstructions}</p>
      ${yotubeHTML}`;

    recipeDetail.dataset.id = meal.idMeal;
    recipeDetail.style.display = "block";
    recipeDetail.scrollIntoView({behavior: "smooth"});
    } catch (error) {
      errorMsg4.style.display = "block";
    }
  }
  
      
      searchBtn.addEventListener("click", async function() {
        const searchValue = searchBox.value.trim();
  
        searchResults.innerHTML = "";
        recipeDetail.innerHTML = "";
        recipeDetail.style.display = "none";
        favoritesResults.innerHTML = "";
        favoritesResults.style.display = "none";
        errorMsg.style.display = "none";
        errorMsg2.style.display = "none";
        errorMsg3.style.display = "none";
        errorMsg4.style.display = "none";
  
        if (searchValue === "") {
          errorMsg.style.display = "block";
          return;
        }
      
        const searchEndpoint = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchValue}`;

    try {
      const response = await fetch(searchEndpoint);
      
        const data = await response.json();
        console.log(data);
      
        if (data.meals === null) {
          errorMsg2.style.display = "block";
        } else {
          const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
          searchResults.style.display = "grid";
          data.meals.forEach(function(meal) {
            const isFavorited = favorites.includes(meal.idMeal);
            const icon = isFavorited ? "★" : "☆";
            const mealCard = `<div class="meal-card" data-id="${meal.idMeal}"> <img src="${meal.strMealThumb}">
  <button class="favorite-btn">${icon}</button>
  <p>${meal.strMeal}</p></div>`;
            searchResults.innerHTML += mealCard;
          })
          searchBox.blur();
        }
    } catch (error) {
      errorMsg4.style.display = "block";
    }
});
      
      searchResults.addEventListener("click", async function(event) {
  
        const favoriteBtn = 
        event.target.closest(".favorite-btn");
  
        if (favoriteBtn) {
        event.stopPropagation();
        const card = favoriteBtn.closest(".meal-card");
        const favoriteId = card.dataset.id;
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        if (favorites.includes(favoriteId)) {
           favorites = favorites.filter(function(favId) {
              return favId !== favoriteId;
            })
              favoriteBtn.textContent = "☆";
          } else {
            favorites.unshift(favoriteId);
            favoriteBtn.textContent = "★";
          }
          localStorage.setItem("favorites", JSON.stringify(favorites));
        return;
        }
        
        const clickedCard = event.target.closest(".meal-card");
        console.log(clickedCard);
    
        if (!clickedCard) {
          return;
        }
    
        const id = clickedCard.dataset.id;
        await showRecipeDetails(id);
      });
  
  searchBox.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      searchBtn.click();
    }
  });
  
  searchBox.addEventListener("input", function() {
    errorMsg.style.display = "none";
    errorMsg2.style.display = "none";
    errorMsg3.style.display = "none";
    recipeDetail.style.display = "none";
  })
  
  favoritesBtn.addEventListener("click", async function () {
    searchResults.innerHTML = "";
    searchResults.style.display = "none";
      recipeDetail.innerHTML = "";
      recipeDetail.style.display = "none";
      favoritesResults.innerHTML = "";
      errorMsg.style.display = "none";
      errorMsg2.style.display = "none";
     errorMsg4.style.display = "none";
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    console.log(favorites);
    if (favorites.length === 0) {
      errorMsg3.style.display = "block";
      return;
    }
    try {
      const fetchPromises = favorites.map(function(id) {
      return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    });
    const responses = await Promise.all(fetchPromises);
    
    const jsonPromises = responses.map(function(response) {
      return response.json();
    })
    const data = await Promise.all(jsonPromises);
    console.log(data);
    const meals = data.map(function(item) {
      return item.meals[0];
    })
    console.log(meals);
    favoritesResults.style.display = "grid";
    meals.forEach(function(meal) {
     const mealCard = `<div class="meal-card" data-id="${meal.idMeal}"> 
     <img src="${meal.strMealThumb}">
     <button class="favorite-btn">★</button>
     <p>${meal.strMeal}</p></div>`;
      favoritesResults.innerHTML += mealCard;
    })
    } catch (error) {
      errorMsg4.style.display = "block";
    }
  });
  favoritesResults.addEventListener("click", async function(event) {
    const favoriteBtn = event.target.closest(".favorite-btn");
    if (favoriteBtn) {
      const card = favoriteBtn.closest(".meal-card");
    const favoriteId = card.dataset.id;
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(function(favId) {
      return favId !== favoriteId;
    });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    if (favorites.length === 0) {
      errorMsg3.style.display = "block";
    }
      if (recipeDetail.dataset.id === favoriteId) {
        recipeDetail.style.display = "none";
      }
    card.remove();
      return;
    }
    const clickedCard = event.target.closest(".meal-card");
    if (!clickedCard) {
      return;
    }
    const id = clickedCard.dataset.id;
    await showRecipeDetails(id);
  })
