const countrySelect = document.getElementById('countrySelect');
const citySelect = document.getElementById('citySelect');
const weatherContent = document.getElementById('weatherContent');
const loadingIndicator = document.getElementById('loading');
const errorMsg = document.getElementById('errorMsg');
const errorText = document.getElementById('errorText');

// UI Elements mapping
const uiElements = {
    locationName: document.getElementById('locationName'),
    temperature: document.getElementById('temperature'),
    weatherDesc: document.getElementById('weatherDesc'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    precipitation: document.getElementById('precipitation'),
    weatherIcon: document.getElementById('weatherIcon')
};

// Weather codes mapping based on WMO Weather interpretation codes
const weatherCodes = {
    0: { desc: 'Clear sky', icon: 'fa-sun', color: '#fbbf24' },
    1: { desc: 'Mainly clear', icon: 'fa-cloud-sun', color: '#f59e0b' },
    2: { desc: 'Partly cloudy', icon: 'fa-cloud-sun', color: '#94a3b8' },
    3: { desc: 'Overcast', icon: 'fa-cloud', color: '#64748b' },
    45: { desc: 'Fog', icon: 'fa-smog', color: '#94a3b8' },
    48: { desc: 'Depositing rime fog', icon: 'fa-smog', color: '#94a3b8' },
    51: { desc: 'Light drizzle', icon: 'fa-cloud-rain', color: '#60a5fa' },
    53: { desc: 'Moderate drizzle', icon: 'fa-cloud-rain', color: '#3b82f6' },
    55: { desc: 'Dense drizzle', icon: 'fa-cloud-showers-heavy', color: '#2563eb' },
    61: { desc: 'Slight rain', icon: 'fa-cloud-rain', color: '#60a5fa' },
    63: { desc: 'Moderate rain', icon: 'fa-cloud-showers-heavy', color: '#3b82f6' },
    65: { desc: 'Heavy rain', icon: 'fa-cloud-showers-water', color: '#2563eb' },
    71: { desc: 'Slight snow fall', icon: 'fa-snowflake', color: '#93c5fd' },
    73: { desc: 'Moderate snow fall', icon: 'fa-snowflake', color: '#60a5fa' },
    75: { desc: 'Heavy snow fall', icon: 'fa-snowflake', color: '#3b82f6' },
    77: { desc: 'Snow grains', icon: 'fa-snowflake', color: '#93c5fd' },
    80: { desc: 'Slight rain showers', icon: 'fa-cloud-rain', color: '#60a5fa' },
    81: { desc: 'Moderate rain showers', icon: 'fa-cloud-showers-heavy', color: '#3b82f6' },
    82: { desc: 'Violent rain showers', icon: 'fa-cloud-showers-water', color: '#2563eb' },
    95: { desc: 'Thunderstorm', icon: 'fa-cloud-bolt', color: '#8b5cf6' },
    96: { desc: 'Thunderstorm with slight hail', icon: 'fa-cloud-bolt', color: '#7c3aed' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'fa-cloud-bolt', color: '#6d28d9' }
};

let countriesData = [];

// Fetch countries and cities on load
async function loadCountries() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await response.json();
        
        if (!data.error) {
            countriesData = data.data;
            populateCountries();
        } else {
            showError('Failed to load countries list.');
        }
    } catch (error) {
        console.error('Error fetching countries:', error);
        showError('Network error while loading countries.');
    }
}

function populateCountries() {
    countrySelect.innerHTML = '<option value="" disabled selected>Select a country</option>';
    
    // Sort alphabetically
    countriesData.sort((a, b) => a.country.localeCompare(b.country));
    
    countriesData.forEach(countryObj => {
        const option = document.createElement('option');
        option.value = countryObj.country;
        option.textContent = countryObj.country;
        countrySelect.appendChild(option);
    });
}

// Event Listeners for Dropdowns
countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    const countryData = countriesData.find(c => c.country === selectedCountry);
    
    if (countryData && countryData.cities.length > 0) {
        populateCities(countryData.cities);
    } else {
        citySelect.innerHTML = '<option value="" disabled selected>No cities available</option>';
        citySelect.disabled = true;
    }
});

function populateCities(cities) {
    citySelect.innerHTML = '<option value="" disabled selected>Select a city</option>';
    
    cities.sort((a, b) => a.localeCompare(b));
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    citySelect.disabled = false;
}

citySelect.addEventListener('change', () => {
    const city = citySelect.value;
    const country = countrySelect.value;
    if (city && country) {
        searchAndLoadWeather(city, country);
    }
});

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

async function searchAndLoadWeather(city, country) {
    showLoading();
    try {
        // Open-Meteo geocoding search
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Try to find exact match for country, otherwise use first result
            let targetCity = data.results.find(c => c.country && c.country.toLowerCase() === country.toLowerCase());
            
            if (!targetCity) {
                targetCity = data.results[0]; // fallback to best result
            }
            
            await fetchWeather(targetCity.latitude, targetCity.longitude, targetCity.name, targetCity.country || country);
        } else {
            showError(`Could not find coordinates for ${city}.`);
        }
    } catch (error) {
        showError('Network error while locating city.');
    }
}

async function fetchWeather(lat, lon, cityName, countryName) {
    showLoading();
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Request Failed');
        const data = await response.json();
        
        updateUI(data.current, cityName, countryName);
    } catch (error) {
        showError('Failed to fetch weather data. Please try again later.');
    }
}

function updateUI(current, cityName, countryName) {
    hideLoading();
    errorMsg.classList.add('hidden');
    weatherContent.classList.remove('hidden');

    uiElements.locationName.textContent = `${cityName}${countryName ? ', ' + countryName : ''}`;
    uiElements.temperature.textContent = `${Math.round(current.temperature_2m)}°`;
    uiElements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
    uiElements.humidity.textContent = `${current.relative_humidity_2m}%`;
    uiElements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    uiElements.precipitation.textContent = `${current.precipitation} mm`;

    const weatherInfo = weatherCodes[current.weather_code] || weatherCodes[0];
    uiElements.weatherDesc.textContent = weatherInfo.desc;
    
    // Update icon
    uiElements.weatherIcon.className = `fa-solid ${weatherInfo.icon} weather-icon`;
    uiElements.weatherIcon.style.background = `linear-gradient(135deg, ${weatherInfo.color}, ${adjustColor(weatherInfo.color, -20)})`;
    uiElements.weatherIcon.style.webkitBackgroundClip = 'text';
    uiElements.weatherIcon.style.webkitTextFillColor = 'transparent';
}

function showLoading() {
    weatherContent.classList.add('hidden');
    errorMsg.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    weatherContent.classList.add('hidden');
    errorText.textContent = message;
    errorMsg.classList.remove('hidden');
}

// Initialize with a default view for Helsinki, Finland to give local context
window.addEventListener('DOMContentLoaded', () => {
    loadCountries();
    fetchWeather(60.1695, 24.9354, 'Helsinki', 'Finland'); 
});
