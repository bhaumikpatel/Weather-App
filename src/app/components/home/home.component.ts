import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Http, HttpModule, URLSearchParams } from '@angular/http';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { finalize, tap } from 'rxjs/operators';
import { Weather } from "../../shared/models";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  // private instance variable to hold base url
  private apiUrl = 'http://api.openweathermap.org/data/2.5/';
  private intervalId;
  // public variable
  public heroForm: FormGroup;
  public weather: Weather;
  public now: Date = new Date();
  public showHideSetting: boolean = false;
  public formSumitAttempt: boolean = false;

  constructor(private http: Http, private fb: FormBuilder) {
    this.createForm();
    setInterval(() => {
      this.now = new Date();
    }, 1);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    navigator.geolocation.getCurrentPosition((pos) => {
      if (localStorage.getItem("cityName")) {
        this.onSubmit();
      } else {
        var crd = pos.coords;
        this.getCurrentWeatherData(`weather?lat=${crd.latitude}&lon=${crd.longitude}`);
      }
    }, (error) => {
      if (localStorage.getItem("cityName")) {
        this.onSubmit();
      }
    }, this.options);
  }

  /**
   * Create form
   */
  createForm() {
    this.heroForm = this.fb.group({
      cityName: ['', Validators.required],
      units: ['imperial', Validators.required],
      appid: ['', Validators.required],
      refreshTime: [5, Validators.required],
    });

    // Set existing value
    if (localStorage.getItem("appid")) {
      this.heroForm.controls['appid'].patchValue(localStorage.getItem("appid"));
    }
    if (localStorage.getItem("units")) {
      this.heroForm.controls['units'].patchValue(localStorage.getItem("units"));
    }
    if (localStorage.getItem("cityName")) {
      this.heroForm.controls['cityName'].patchValue(localStorage.getItem("cityName"));
    }
  }

  /**
   * geolocation options
   */
  options = {
    enableHighAccuracy: true
  };

  /**
   * Invoked on setting click event
   */
  changeShowStatus() {
    this.showHideSetting = !this.showHideSetting;
  }

  /**
   * Invoked on form submit 
   */
  onSubmit() {
    if (this.heroForm.valid) {
      let formData = this.heroForm.value;
      this.getCurrentWeatherData(`weather?q=${formData.cityName}`);
    }
    else {
      this.formSumitAttempt = true;
      this.validateAllFormFields(this.heroForm);
    }
  }

  /**
   * Get current weather data
   * @param url request URL string
   */
  getCurrentWeatherData(url: string) {
    var formData = this.heroForm.value;
    if (formData.appid) {
      let search = new URLSearchParams();
      // OpenWeatherMap API appid
      search.set('appid', formData.appid);
      //For temperature in Fahrenheit use units=imperial
      //For temperature in Celsius use units=metric
      search.set('units', formData.units);
      if (typeof (Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.setItem("appid", formData.appid);
        localStorage.setItem("units", formData.units);
        localStorage.setItem("cityName", formData.cityName);
      }
      //OpenWeatherMap API request
      this.http.get(this.apiUrl + url, { search: search })
        .subscribe((res) => {
          this.weather = new Weather();
          Object.assign(this.weather, res.json());
          this.weather.setData();
          this.heroForm.controls['cityName'].patchValue(this.weather.name);

          // Clear previous interval id
          if (this.intervalId) {
            clearInterval(this.intervalId);
          }

          this.intervalId = setInterval(() => {
            this.onSubmit();
          }, formData.refreshTime * 1000 * 60);

        }, (error) => {
          alert("City not found.");
        });
    }
  }

  /**
   * Radio button change event
   */
  onRadioChange() {
    this.onSubmit();
  }

  /**
   * Check field is valid
   * @param field 
   */
  isFieldValid(field: string) {
    return (
      (!this.heroForm.get(field).valid && this.heroForm.get(field).touched) ||
      (this.heroForm.get(field).untouched && this.formSumitAttempt)
    );
  }

  /**
   * Set validate class
   * @param field 
   */
  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  /**
   * Validate form fields
   * @param formGroup from
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
