const searchBar = document.getElementById('search-bar');
const searchBtn = document.getElementById('search-button');

var pastSearches = [];

init();
// retrieve past searches from local storage on page refresh
function init() {
    getPastSearches(); 
    addListenerToSearchBtn();
}

function addListenerToSearchBtn() {
    searchBtn.addEventListener('click', searchSubmit)
}

function searchSubmit() {
    if (!searchBar.value.trim()) {
        alert("Please enter a city name.");
    } else {
        // This code capitalizes the first alphabet of the city name.
        let firstChar = searchBar.value.trim().charAt(0).toUpperCase(); 
        let remainingChar = searchBar.value.trim().slice(1).toLowerCase(); 
        // returns city name, which is used to fetch latitude and longitude coordinates from API
        var searchQuery = firstChar + remainingChar; 
        console.log(searchQuery);
        getCoordinates(searchQuery); 
        searchBar.value = ''; 
    }
}