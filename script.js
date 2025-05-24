async function getWeather(city) {
    const apiKey = "ec4aed59ad6897520723317797784429";
    const loading = document.getElementById('loading');
    const cityInput = document.getElementById('cityInput');
    const searchButton = document.getElementById('searchButton');

    try {
        loading.style.display = 'block';
        cityInput.disabled = true;
        searchButton.disabled = true;

        // Validate city input
        if (!city.match(/^[a-zA-Z\s-]+$/)) {
            throw new Error('Please enter a valid city name');
        }

        // Fetch current weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            throw new Error(weatherData.message || 'City not found');
        }

        // Update current weather UI
        document.getElementById('weatherCondition').innerText = `${weatherData.weather[0].main} in ${weatherData.name}, ${weatherData.sys.country}`;
        document.getElementById('temperature').innerText = `${Math.round(weatherData.main.temp)}°C`;
        document.getElementById('rainChance').innerText = `Humidity ${weatherData.main.humidity}%`;
        document.getElementById('datetime').innerText = new Date().toLocaleString();

        // Update weather icon
        const weatherMain = weatherData.weather[0].main.toLowerCase();
        const iconClass = weatherMain === 'clear' ? 'fa-sun' :
                         weatherMain === 'clouds' ? 'fa-cloud' :
                         weatherMain === 'rain' ? 'fa-cloud-rain' :
                         weatherMain === 'snow' ? 'fa-snowflake' :
                         weatherMain === 'thunderstorm' ? 'fa-bolt' :
                         weatherMain === 'drizzle' ? 'fa-cloud-rain' :
                         'fa-cloud';
        const weatherIcon = document.getElementById('weatherIcon');
        weatherIcon.className = `fas ${iconClass} weather-icon`;

        // Fetch forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
            throw new Error('Could not fetch forecast data');
        }

        // Update forecast UI
        updateForecast(forecastData.list);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('weatherCondition').innerText = error.message;
        document.getElementById('temperature').innerText = '--°C';
        document.getElementById('rainChance').innerText = 'Humidity --';
        document.getElementById('datetime').innerText = '--';
        document.getElementById('forecast').innerHTML = '';
    } finally {
        loading.style.display = 'none';
        cityInput.disabled = false;
        searchButton.disabled = false;
    }
}

function updateForecast(forecastList) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyData = {};
    const now = new Date();

    // Group forecast by date
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toDateString();
        const dayName = days[date.getDay()];

        // Skip dates before today
        if (date < now) return;

        // Initialize data for this day if not exists
        if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
                dayName: dayName,
                temps: [],
                icons: [],
                date: date
            };
        }

        // Collect all temperatures and weather conditions for the day
        dailyData[dateStr].temps.push(item.main.temp);
        dailyData[dateStr].icons.push(item.weather[0].main);
    });

    // Convert dailyData to array and sort by date
    let sortedDays = Object.values(dailyData)
        .sort((a, b) => a.date - b.date)
        .slice(0, 5); // Limit to 5 days to match API data

    console.log('Sorted days for forecast:', sortedDays);

    // Clear existing forecast
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    // Create and populate day boxes
    sortedDays.forEach(dayForecast => {
        if (dayForecast.temps.length > 0) {
            // Calculate average temperature
            const avgTemp = Math.round(
                dayForecast.temps.reduce((a, b) => a + b, 0) / dayForecast.temps.length
            );

            // Get most frequent weather condition
            const mostFrequentIcon = dayForecast.icons.reduce((a, b) =>
                dayForecast.icons.filter(v => v === a).length >= dayForecast.icons.filter(v => v === b).length ? a : b
            );

            const icon = mostFrequentIcon.toLowerCase();
            const iconClass = icon === 'clear' ? 'fa-sun' :
                             icon === 'clouds' ? 'fa-cloud' :
                             icon === 'rain' ? 'fa-cloud-rain' :
                             icon === 'snow' ? 'fa-snowflake' :
                             icon === 'thunderstorm' ? 'fa-bolt' :
                             icon === 'drizzle' ? 'fa-cloud-rain' :
                             'fa-cloud';

            // Create day box
            const dayBox = document.createElement('div');
            dayBox.className = `dayBox ${dayForecast.dayName.toLowerCase()}Box`;
            dayBox.innerHTML = `
                <div>
                    <i class="fas ${iconClass} weather-icon"></i>
                    <div>${dayForecast.dayName.slice(0, 3)}</div>
                    <div>${avgTemp}°C</div>
                </div>
            `;
            forecastContainer.appendChild(dayBox);
        }
    });
}

// Event listeners
const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

// Start with a default city
getWeather('Delhi');