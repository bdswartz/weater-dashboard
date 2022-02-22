var mainContentEl = document.querySelector(".weather-data");
var dayOfWeek = [
    "Sun", 
    "Mon", 
    "Tues", 
    "Wed", 
    "Thurs", 
    "Fri", 
    "Sat"
];
var monthOfYear = [
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December"
];
var cityHistoryObj = [{}];
var apiKey = "d46c028b6162e14973f53abc548772fa";

var pullHistory = function() {
    // if no local storage, need to get user input right away
    cityHistoryObj = JSON.parse(localStorage.getItem("cityhistory"));
    // updateCityDisplay(cityHistoryObj);
    // getWeatherData(cityHistoryObj[0]);
}

var getCity = function() {
    event.preventDefault();
    var userInput = document.querySelector("#city-search-input").value;
    document.querySelector("#city-search-input").value = "";
    // If the user enters a valid US Zip Code, perform a search for city, Lat, and Long
    if (isValidUSZip(userInput)) {
    apiZipUrl = "https://api.openweathermap.org/geo/1.0/zip?zip=" + userInput + ",US&appid=" + apiKey;
    fetch(apiZipUrl).then(function(response) {
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
                // pass response data to display function
                var cityObj = {Name: data.name, Lat: data.lat, Long: data.lon};
                // // if the city is already in history, remove it and move it to index 0
                // for (var removeIndex = 0; removeIndex < cityHistoryObj.length; removeIndex++) {
                //     if (cityObj.Name == cityHistoryObj[removeIndex].Name) {
                //         cityHistoryObj.splice(removeIndex,1);
                //     };
                // };
                // // Insert new city data in the 0 index position
                // cityHistoryObj.unshift(cityObj);
                // // Trim the city data object to only keep the most recent 10 in memory
                // cityHistoryObj = cityHistoryObj.slice(0,10);
                // localStorage.setItem("cityhistory", JSON.stringify(cityHistoryObj));
                updateCityHistory(cityObj);
                updateCityDisplay(cityHistoryObj);
                getWeatherData(cityObj);
            }
        )}
            else {
                alert('Error: City Not Found');
            }
    })
    .catch(function(error) {
        alert("Unable to connect to for city data");
        });
    }
    else {
        var apiCityUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + userInput + "&limit=5&appid=" + apiKey;
        fetch(apiCityUrl).then(function(response) {
            // request was successful
            if (response.ok) {
                response.json().then(function(data) {
                    // pass response data to display function
                    var cityObj = {Name: data[0].name, Lat: data[0].lat, Long: data[0].lon};
                    // if the city is already in history, remove it and move it to index 0
                    for (var removeIndex = 0; removeIndex < cityHistoryObj.length; removeIndex++) {
                        if (cityObj.Name == cityHistoryObj[removeIndex].Name) {
                            cityHistoryObj.splice(removeIndex,1);
                        };
                    };
                    cityHistoryObj.unshift(cityObj);
                    cityHistoryObj = cityHistoryObj.slice(0,10);
                    localStorage.setItem("cityhistory", JSON.stringify(cityHistoryObj));
                    updateCityDisplay();
                    getWeatherData(cityObj);
                // check if api has paginated issues  
                }
            )}
                else {
                    alert('Error: City Not Found');
                }
        })
    };
};

var getCityPosition = function(geoLat,geoLong) {
    console.log(geoLat);
    console.log(geoLong);
    var apiUrl = "http://api.openweathermap.org/geo/1.0/reverse?lat=" + geoLat + "&lon=" + geoLong + "&limit=1&appid=" + apiKey;
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        var cityObj = {Name: data[0].name, Lat: data[0].lat, Long: data[0].lon};
        updateCityHistory(cityObj);
        updateCityDisplay();
        getWeatherData(cityObj);
    })
   .catch((error) => {
    console.log(error);
   alert("Unable to connect to for city data");
    });
};

var getWeatherData = function(cityObj) {
    // Build api request url with city data object information
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityObj.Lat + "&lon=" + cityObj.Long + "&exclude=minutely,hourly&appid=" + apiKey + "&units=imperial";
    fetch(apiUrl).then(function(response) {
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
            // pass response data to display function
            displayCurrentWeather(data, cityObj);
            buildForecast(data);
            // check if api has paginated issues  
            }
            )}
        else {
            alert("Error getting weather data from server");
        }
      })
      .catch(function(error) {
        alert("Unable to connect to weather server");
    });
  };

var displayCurrentWeather = function(weatherData,city) {
    // Clear the main content and build the current weather display elements
    mainContentEl.innerHTML = "";
    // Build current weather conditions icon request url
    var currWeatherContEl = document.createElement("div");
    currWeatherContEl.className = "current-weather";
    var currWeatherInfoEl = document.createElement("div")
    currWeatherInfoEl.className = "half-container"
    var currWeatherHeadBlockEl = document.createElement("div");
    currWeatherHeadBlockEl.className = "current-half";
    var currWeatherInfoBlockEl = document.createElement("div");
    currWeatherInfoBlockEl.className = "current-half";
    var currCityEl = document.createElement("h2");
    currCityEl.className = "city-display";
    currCityEl.textContent = city.Name;
    var date = dateConvert(weatherData.current.dt);
    var currDateEl = document.createElement("h3");
    currDateEl.textContent = date.Month + " " + date.Date + ", " + date.Year;
    var currWeatherIcon = document.createElement("img");
    iconApiUrl = "https://openweathermap.org/img/wn/" + weatherData.current.weather[0].icon + "@2x.png";
    // Create icon and update weather data display element
    currWeatherIcon.src = iconApiUrl;
    var currTempEl = document.createElement("p");
    currTempEl.className = "current-data"
    // currTempEl.textContent = "Temp:  " + weatherData.current.temp + " F";
    currTempEl.innerHTML = "<span>Temp:  </span><span id='currentTemp'>" + weatherData.current.temp + " F</span>";
    var currWindEl = document.createElement("p");
    // currWindEl.textContent = "Wind:  " + weatherData.current.wind_speed + " mph";
    currWindEl.innerHTML = "<span>Wind:  </span><span id='currentWind'>" + weatherData.current.wind_speed + " mph</span>";
    var currHumidEl = document.createElement("p");
    // currHumidEl.textContent = "Humidity:  " + weatherData.current.humidity + " %";
    currHumidEl.innerHTML = "<span>Humidity:  </span><span id='currentHumid'>" + weatherData.current.humidity + " %</span>";
    var currUviEl = document.createElement("div");
    uviNum = parseFloat(weatherData.current.uvi);
    currUviEl.innerHTML = "<span>UV Index:  </span><span id='currentUv'>" + uviNum + "</span>";
    currWeatherHeadBlockEl.append(currDateEl, currWeatherIcon);
    currWeatherInfoBlockEl.append(currTempEl, currWindEl, currHumidEl, currUviEl);
    currWeatherContEl.appendChild(currCityEl)
    currWeatherInfoEl.appendChild(currWeatherHeadBlockEl);
    currWeatherInfoEl.appendChild(currWeatherInfoBlockEl);
    currWeatherContEl.appendChild(currWeatherInfoEl);
    mainContentEl.appendChild(currWeatherContEl);
    // Color code the background of the UVI with EPA levels and color codes
    if (uviNum < 3.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(0, 252, 0); color: black;");
    }
    else if (uviNum >= 3.0 && uviNum < 6.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(252, 252, 0); color: black;)");
    }
    else if (uviNum >= 6.0 && uviNum < 8.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(252, 126, 0); color: white;)");
    }
    else if (uviNum >= 8.0 && uviNum < 11.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(252, 0, 0); color: white;)");
    }
    else {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(126, 0, 252); color: white;)");
    }

    };
    
var buildForecast = function(data) {
    // Build the 5 day forecast
    var extendedForecastEl = document.createElement("div");
    extendedForecastEl.className = "extended-forecast";
    var fiveDayHeaderEl = document.createElement("h3");
    fiveDayHeaderEl.textContent = "5-Day Forecast";
    var dayCardContainerEl = document.createElement("div");
    dayCardContainerEl.className = "day-card-container";
    // Display the forecast section title
    extendedForecastEl.append(fiveDayHeaderEl,dayCardContainerEl);
    mainContentEl.appendChild(extendedForecastEl);
    // Build the 5 day cards and display in the forecast section
    for (var index = 1; index<6; index++) {
        iconApiUrl = "https://openweathermap.org/img/wn/" + data.daily[index].weather[0].icon + "@2x.png";
        // Create the elements for the weather card
        var date = dateConvert(data.daily[index].dt);
        var forecastCardEl = document.createElement("div");
        forecastCardEl.className = "day-card";
        var foreCardHeadEl = document.createElement("div");
        foreCardHeadEl.className = "forecast-head";
        var foreCardInfoEl = document.createElement("div");
        foreCardInfoEl.className = "forecast-info";
        var forecastDateEl = document.createElement("h4");
        forecastDateEl.textContent = date.Day;
        var forecastIconEl = document.createElement("img");
        forecastIconEl.src = iconApiUrl;
        var forecastTempEl = document.createElement("p");
        forecastTempEl.textContent = "Temp:      " + data.daily[index].temp.max + " F";
        var forecastWindEl = document.createElement("p");
        forecastWindEl.textContent = "Wind:     " + data.daily[index].wind_speed + " mph";
        var forecastHumidityEl = document.createElement("p");
        forecastHumidityEl.textContent = "Humidity:     " + data.daily[index].humidity + " %";
        // append the weather data to the weather card
        foreCardHeadEl.appendChild(forecastDateEl);
        foreCardHeadEl.appendChild(forecastIconEl);
        console.log(foreCardHeadEl);
        console.log(foreCardInfoEl);
        foreCardInfoEl.appendChild(forecastTempEl);
        foreCardInfoEl.appendChild(forecastWindEl);
        foreCardInfoEl.appendChild(forecastHumidityEl);
        // Append daily weather card to the container
        forecastCardEl.appendChild(foreCardHeadEl);
        forecastCardEl.appendChild(foreCardInfoEl);
        dayCardContainerEl.appendChild(forecastCardEl);
    }
};
var updateCityHistory = function(cityObj) {
    // if the city is already in history, remove it and move it to index 0
    for (var removeIndex = 0; removeIndex < cityHistoryObj.length; removeIndex++) {
        if (cityObj.Name == cityHistoryObj[removeIndex].Name) {
            cityHistoryObj.splice(removeIndex,1);
        };
    };
    // Insert new city data in the 0 index position
    cityHistoryObj.unshift(cityObj);
    // Trim the city data object to only keep the most recent 10 in memory
    cityHistoryObj = cityHistoryObj.slice(0,10);
    localStorage.setItem("cityhistory", JSON.stringify(cityHistoryObj));
};

var updateCityDisplay = function () {
    // find container and create list items for the city history
    var cityListEl = document.querySelector(".city-list");
    // clear old list out of container
    cityListEl.innerHTML = "";
    // Cycle through the city data and build the clickable city history list
    for (let index=0 ; index<cityHistoryObj.length ; index++) {
        if (cityHistoryObj[index].Name) {
        var cityHistoryItemEl = document.createElement("li")
        cityHistoryItemEl.className = "city-item"
        var cityHistoryBtnEl = document.createElement("button")
        cityHistoryBtnEl.dataset.listPosition = index;
        cityHistoryBtnEl.textContent = cityHistoryObj[index].Name;
        cityHistoryBtnEl.className = "city-button"
        cityHistoryItemEl.appendChild(cityHistoryBtnEl);
        cityListEl.appendChild(cityHistoryItemEl);
        };
    }
};

var dateConvert = function(date) {
    // Convert UNIX time code passed to function to JS date/time
    fullDateConverted = new Date(date * 1000);
    // Extract day/date info from converted date/time
    var day = fullDateConverted.getDay();
    var month = fullDateConverted.getMonth();
    var date = fullDateConverted.getDate();
    var year = fullDateConverted.getFullYear();
    // Pass array with converted (to user-readable) day of week, month, date, and year
    var dayDateObject = {Day: dayOfWeek[day], Month: monthOfYear[month], Date: date, Year: year};
    return dayDateObject;
};
// Function to check if user input is a zip code (5 or 9 digit format)
function isValidUSZip(zipCode) {
    return /^\d{5}(-\d{4})?$/.test(zipCode);
 }

  document.querySelector(".city-form").addEventListener("submit", getCity);
  document.querySelector(".city-list").addEventListener("click", function(event) {
      targetClickEl = event.target
      index = targetClickEl.dataset.listPosition;
      var cityChoiceObj = cityHistoryObj.splice(index,1);
      cityHistoryObj.unshift(cityChoiceObj[0]);
      getWeatherData(cityChoiceObj[0]);
      updateCityDisplay();
      updateCityHistory(cityChoiceObj[0]);
  });

if (localStorage.getItem("cityhistory")) {
      pullHistory();};

if (navigator.geolocation) {
    var options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      };

    function success(position) {
    var geoLat = position.coords.latitude;
    var geoLong = position.coords.longitude;
    getCityPosition(geoLat,geoLong);
    };

    function error(err) {
        alert(err);
        updateCityDisplay();
        getWeatherData(cityHistoryObj[0]);
    };
    navigator.geolocation.getCurrentPosition(success,error,options);
    }
    else {
        updateCityDisplay();
        getWeatherData(cityHistoryObj[0]);
    };