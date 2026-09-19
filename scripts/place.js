const temperature = 5;
const windSpeed = 15;

function calculateWindChill(temp, speed) {
    return (13.12 + 0.6215 * temp - 11.37 * Math.pow(speed, 0.16) + 0.3965 * temp * Math.pow(speed, 0.16)).toFixed(1);
}

window.addEventListener("DOMContentLoaded", () => {
    const windChillSpan = document.querySelector("#windchill");    
    let result;
    
    if (temperature <= 10 && windSpeed > 4.8) {
        result = `${calculateWindChill(temperature, windSpeed)} °C`;
    } else {
        result = "N/A";
    }
    
    if (windChillSpan) {
        windChillSpan.textContent = result;
    }
});