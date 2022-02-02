
var cityLocation = {
    lat:  35,
    long: -80
};
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

var apiKey = "d46c028b6162e14973f53abc548772fa";
var displayCurrentWeather = function(data) {
    iconApiUrl = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
    document.querySelector(".current-conditions-icon").src = iconApiUrl;
    var date = dateConvert(data.current.dt);
    document.querySelector(".todays-date").textContent = date.Month + " " + date.Date + ", " + date.Year;
    document.querySelector("#currentTemp").textContent = data.current.temp + " F";
    document.querySelector("#currentWind").textContent = data.current.wind_speed + " mph";
    document.querySelector("#currentHumidity").textContent = data.current.humidity + " %";
    console.log(data.current.uvi);
    document.querySelector("#currentUv").textContent = data.current.uvi;
    };
    
var buildForecast = function(data) {
    for (var index = 1; index<6; index++) {
        iconApiUrl = "http://openweathermap.org/img/wn/" + data.daily[index].weather[0].icon + "@2x.png";
        // Create the elements for the weather card
        var date = dateConvert(data.daily[index].dt);
        var forecastCardContainerEl = document.querySelector(".day-card-container")
        var forecastCardEl = document.createElement("div");
        forecastCardEl.className = "day-card";
        var forecastDateEl = document.createElement("h4");
        console.log(date.Day);
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
        forecastCardEl.appendChild(forecastDateEl);
        forecastCardEl.appendChild(forecastIconEl);
        forecastCardEl.appendChild(forecastTempEl);
        forecastCardEl.appendChild(forecastWindEl);
        forecastCardEl.appendChild(forecastHumidityEl);
        // Append daily weather card to the container
        forecastCardContainerEl.appendChild(forecastCardEl);
    }
};

var getCity = function() {
    var zipCode = document.querySelector("#city-search-input");
    apiCityUrl = "http://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + ",US&appid=" + apiKey
};

var dateConvert = function(date) {
    fullDateConverted = new Date(date * 1000);
    var day = fullDateConverted.getDay();
    console.log(day);
    var month = fullDateConverted.getMonth();
    var date = fullDateConverted.getDate();
    var year = fullDateConverted.getFullYear();
    var dayDateObject = {Day: dayOfWeek[day], Month: monthOfYear[month], Date: date, Year: year}
    return dayDateObject;
};

var getWeatherData = function(cityLocation) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLocation.lat + "&lon=" + cityLocation.long + "&exclude=minutely,hourly,alerts&appid=" + apiKey + "&units=imperial";
    fetch(apiUrl).then(function(response) {
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
            // pass response data to display function
            displayCurrentWeather(data);
            buildForecast(data);
            // check if api has paginated issues  
            }
            )}
        else {
            // TBD ***************
        }
      });
  };

  document.querySelector(".city-form").addEventListener("submit", getCity);

console.log("good");
getWeatherData(cityLocation);