# 🌤️ Atmosphere - Elegant Weather Insights

Atmosphere is a modern, responsive weather application built with a focus on aesthetics and ease of use. It allows users to browse weather data globally by selecting a country and then picking from a list of recognized cities within that country.

## 🚀 Live Demo
Once deployed to GitHub Pages, you can access your app at:
`https://royaabast.github.io/weather-app-atmosphere/`

## ✨ Key Features
- **Cascading Dropdowns**: Select a country to instantly populate a list of available cities.
- **Real-Time Data**: Fetches the latest temperature, humidity, wind speed, and precipitation.
- **Dynamic Glassmorphism UI**: A premium frosted-glass design with animated background blobs.
- **Smart Icons**: Weather icons dynamically change based on the WMO weather condition codes (Clear, Rain, Snow, Thunderstorm, etc.).
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

## 🛠️ Technology Stack
- **Languages**: HTML5, Vanilla CSS3, Javascript (ES6+).
- **APIs**:
  - [Open-Meteo API](https://open-meteo.com/): Current weather forecasts and geocoding.
  - [CountriesNow API](https://countriesnow.space/): Global country-to-city mapping data.
- **Fonts & Icons**: 
  - [Google Fonts (Outfit)](https://fonts.google.com/specimen/Outfit)
  - [FontAwesome 6](https://fontawesome.com/)

## 📖 Important Implementation Steps

### 1. Data Integration (The API Bridge)
The app uses two separate APIs. First, when the page loads, `app.js` calls the **CountriesNow API** to fetch a list of over 200 countries. This ensures the dropdowns are always accurate without needing a manual list in the code.

### 2. Cascading Selection Logic
The city selector is locked by default. Once a user picks a country, a listener detects the change:
```javascript
countrySelect.addEventListener('change', () => {
    // 1. Identify countryData
    // 2. Clear old cities
    // 3. Populate new cities from search results
    // 4. Unlock citySelect
});
```

### 3. Geocoding & Weather Mapping
Since weather APIs need coordinates (Latitude/Longitude), but users pick names (e.g., "Helsinki"), the app uses a **Geocoding** step. When you pick a city:
1. It sends the city name to Open-Meteo's geocoding endpoint.
2. It cross-references the result with the selected country to ensure the correct "London" (UK, not Canada) is picked.
3. It uses the coordinates to pull the final weather packet.

### 4. Glassmorphism Styling
The aesthetic was achieved using:
- `backdrop-filter: blur(20px)` on the container.
- Semi-transparent background colors (`rgba(255, 255, 255, 0.5)`).
- Animated CSS blobs (`@keyframes float`) moving in the background to create depth.

## 📦 Local Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/royaabast/weather-app-atmosphere.git
   ```
2. Open `index.html` in any modern web browser. 

---
*Created with ❤️ using Antigravity AI.*
