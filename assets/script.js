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
function getCoordinates(searchQuery) {
    // Get city coordinates (i.e. latitude and longitude) through API
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&appid=03515a0380dfd9b5a3ed7a523322404b`)
        .then(function(response){
            if (response.status === 404) {
                throw new Error('API Not found');
            } 
            else if(response.status === 500) {
                throw new Error('API Error');
            }
            else {
                return response.json();
            }
        })
        .catch(function(err) {
            alert(err);
        })
        .then(function(data){
            if(!data) {
                return;
            }
            else if (data.length === 0) {
                alert("Your city doesn't exist. Please try again.")
                return
            } else {
                var cityCoordinates = {
                    latitude: data[0].lat,
                    longitude: data[0].lon,
                }
                getCurrentWeather(searchQuery, cityCoordinates);
                getForecastWeather(cityCoordinates);
                savePastSearches(searchQuery);
            }
        })
}

function getCurrentWeather(searchQuery, cityCoordinates) {
    const currentCityDisplay = document.getElementById('current-city');
    const todayTempEl = document.getElementById('today-temperature');
    const todayWindEl = document.getElementById('today-wind-speed');
    const todayHumidEl = document.getElementById('today-humidity');
    const currentClimateIcon = document.getElementById('current-climate-icon');

    if(cityCoordinates) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${cityCoordinates.latitude}&lon=${cityCoordinates.longitude}&units=imperial&appid=03515a0380dfd9b5a3ed7a523322404b`)
        .then(function(response){
            if (response.status === 404) {
                throw new Error('API not found.');
            } else if (response.status === 500) {
                throw new Error('API error.');
            } else {
            return response.json();
            }
        })
        .catch(function(err) {
            alert(err);
        })
        .then(function(data){
            if(!data) {
                return;
            }
            var currentCityClimate = {
                humidity: data.main.humidity,
                icon: data.weather[0].icon,
                temperature: data.main.temp,
                windSpeed: data.wind.speed,
                date: data.dt,
            }
            var todayDate = dayjs.unix(currentCityClimate.date).format('D/M/YYYY')
        
            currentCityDisplay.innerHTML = `${searchQuery} (${todayDate})`;
            currentClimateIcon.src = `https://openweathermap.org/img/wn/${currentCityClimate.icon}@2x.png`;
            todayTempEl.innerText = `Temp: ${currentCityClimate.temperature} °F`;
            todayWindEl.innerText = `Wind: ${currentCityClimate.windSpeed} MPH`;
            todayHumidEl.innerText = `Humidity: ${currentCityClimate.humidity}%`;
        })
    }
}

function getForecastWeather(cityCoordinates) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cityCoordinates.latitude}&lon=${cityCoordinates.longitude}&units=imperial&appid=03515a0380dfd9b5a3ed7a523322404b`)
    .then(function(response) {
        if(response.status === 404) {
            throw new Error('API Not found');
        } 
        else if(response.status === 500) {
            throw new Error('API Error');
        } else {
        return response.json();
        }
    })
    .catch(function(err) {
        alert(err);
    })
    .then(function(data) {
        if(!data) {
            return;
        }
        let fiveDayWeather = [];
        console.log(data);
        for(let i = 0; i < data.list.length; i++) {
            const currentDate = data.list[i].dt_txt; 
            if(currentDate.split(" ")[1] === '00:00:00') { 
                fiveDayWeather.push(data.list[i]); 
            }
        }
        console.log(fiveDayWeather);
        renderFutureForecast(fiveDayWeather);
    })
}
// clear existing HTML elements (i.e., forecastCards)
function renderFutureForecast(fiveDayWeather) {
    const forecastContainer = document.getElementById('weather-forecast-card-container');
    forecastContainer.innerHTML = ''; 
    for (var i = 0; i < fiveDayWeather.length; i++) {
        let forecastCard = `<div class="weather-forecast-card">
                                    <h5>${dayjs(fiveDayWeather[i].dt_txt).format('D/MM/YYYY')}</h5>
                                    <div id="climate-icon-${i+1}">
                                        <img width="40px" src="https://openweathermap.org/img/wn/${fiveDayWeather[i].weather[0].icon}@2x.png" alt="an icon image of the forecasted weather condition">
                                    </div>
                                    <p>Temperature: ${fiveDayWeather[i].main.temp} °F</p>
                                    <p>Wind: ${fiveDayWeather[i].wind.speed}MPH</p>
                                    <p>Humidity: ${fiveDayWeather[i].main.humidity}%</p>
                                </div>`;

        
        forecastContainer.insertAdjacentHTML('beforeend', forecastCard);
    }
}
// array.unshift() adds new search query element to the beginning of the array
function savePastSearches(searchQuery) {
    const foundIndex = pastSearches.findIndex((item)=> {
        return item === searchQuery;
    })
    if(foundIndex === -1) {
        pastSearches.unshift(searchQuery); 
    } else {
        pastSearches.splice(foundIndex, 1); 
        pastSearches.unshift(searchQuery);
    }
    renderPastSearches();
    localStorage.setItem('weatherDashboard', JSON.stringify(pastSearches));
}
// clear existing HTML elements (i.e., pastSearches buttons)
function renderPastSearches() {
    let pastSearchesContainer = document.getElementById('past-searches-container');
    pastSearchesContainer.innerHTML = ''; 
    let round = pastSearches.length < 8 ? pastSearches.length : 8; 

    for (var i = 0; i < round; i++) {
        let pastSearchBtn = `<button class="past-search-btn" onclick="pastSearchBtnSubmit(event)">${pastSearches[i]}</button>`;
        pastSearchesContainer.insertAdjacentHTML('beforeend', pastSearchBtn);
    }
}
// initial city to render weather reports when the web app is loaded for the first time.
function getPastSearches() {
    var savedPastSearches = JSON.parse(localStorage.getItem('weatherDashboard'));
    if (savedPastSearches !== null) {
        pastSearches = savedPastSearches;
        getCoordinates(pastSearches[0]);
    } else {
        getCoordinates('Sydney');
    }
}

function pastSearchBtnSubmit(event) {
    console.log(event.target);
    let searchQuery = event.target.innerText;
    getCoordinates(searchQuery);
}