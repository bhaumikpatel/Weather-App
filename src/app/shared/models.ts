export class Weather {
  coord?: {
    lon: Float64Array,
    lat: Float64Array
  };
  weather: Array<{ id: number, main: string, description: string, icon: string }>;
  base?: string;
  main: {
    temp: number,
    pressure: number,
    humidity: number,
    temp_min: number,
    temp_max: number
  };
  visibility?: number;
  wind: {
    speed: Float64Array,
    deg: number
  };
  clouds: {
    all: 0
  };
  dt?: number;
  sys: {
    type: number,
    id: number,
    message: Float64Array,
    country: string,
    sunrise: number,
    sunset: number
  };
  id?: number;
  name?: string;
  cod?: number;

  // Custom property
  weatherIcon?: string
  sunriseTime?: string
  sunsetTime?: string

  setData() {

    if (!this.sys.sunrise)
      return "";

    const date = new Date();
    const sunrise = new Date(this.sys.sunrise * 1000); //Convert a Unix timestamp to time
    const sunset = new Date(this.sys.sunset * 1000);

    this.sunriseTime = `${sunrise.getHours()}:${sunrise.getMinutes()}`
    this.sunsetTime = `${sunset.getHours()}:${sunset.getMinutes()}`

    /* Get suitable icon for weather */
    if (date.getHours() >= sunrise.getHours() && date.getHours() < sunset.getHours()) {
      this.weatherIcon = `wi wi-owm-day-${this.weather[0].id}`;
    }
    else if (date.getHours() >= sunset.getHours() || date.getHours() < sunrise.getHours()) {
      this.weatherIcon = `wi wi-owm-night-${this.weather[0].id}`;
    }
  }
}