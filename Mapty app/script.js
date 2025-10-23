'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = new Date().getTime().toString().slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _workoutDecription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} on ${this.date.getDate()}${this.date.getDate() < 2 ? 'st' : 'th'} ${
      months[+this.date.getMonth()]
    }`;
  }
  click() {
    this.clicks++;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcPace();
    this._workoutDecription();
  }
  calcPace() {
    // Formula for calculating Pace is : Time / Distance
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcSpeed();
    this._workoutDecription();
  }
  calcSpeed() {
    //The formula for speed is: Distance/ Time
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([39, -12], 5.2, 24, 178);
const cycle1 = new Cycling([39, -12], 27, 95, 523);
console.log(run1, cycle1);

/////////////////////////////////////
// THE APPLICATION ARCHITECTURE
class App {
  #map;
  #mapE;
  #workout = [];

  constructor() {
    //get Position
    this._getPosition();

    //load workout for  local storage
    this._loadWorkout()

    //eventListener
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToClick.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    let { latitude } = position.coords;
    let { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);
    attribution: '&copy; OpenStreetMap, © JawgMaps',
      L.tileLayer(
        'https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=iw2zHLa099nToloJFH00IDmrnMynUA0PoX25JnyPt3dnt099uouHEO5OMj5EBzuc',
        {}
      ).addTo(this.#map);

    L.marker(coords).addTo(this.#map).bindPopup('Present Location').openPopup();

    //handling click on map
    this.#map.on('click', this._showForm.bind(this));
      //get information from the local storaget and render the marker on the loaded app

    this.#workout.forEach(work => 
      this._renderWorkoutMarker(work)
    )
  }
  _showForm(mapEvent) {
    this.#mapE = mapEvent;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    //toggleElevationField()
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');

    
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  //newWorkout()
  _newWorkout(e) {
    e.preventDefault();
    const validInput = (...input) => input.every(inp => Number.isFinite(inp));
    const isPositive = (...input) => input.every(inp => inp > 0);
    const { lat, lng } = this.#mapE.latlng;
    let workout;

    //Get data from form
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    //Check if data is valid
    if (inputType.value === 'running') {
      const cadence = +inputCadence.value;
      if (
        validInput(distance, duration, cadence) &&
        isPositive(distance, duration, cadence) &&
        duration &&
        distance &&
        cadence
      ) {
        //If workout is running, create running object
        workout = new Running([lat, lng], distance, duration, cadence);

        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
      } else {
        //if valid is not validated
        return alert('Inputs have to be positive numbers!');
      }
    }

    //If workout is cycling, create cycling object
    if (inputType.value === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        validInput(distance, duration, elevation) &&
        isPositive(distance, duration, elevation) &&
        duration &&
        distance &&
        elevation
      ) {
        //If workout is running, create running object
        workout = new Cycling([lat, lng], distance, duration, elevation);

        //Render workout on map as marker
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
      } else {
        //if valid is not validated
        return alert('Inputs have to be positive numbers!');
      }
    }

    //Add new object to workout array
    this.#workout.push(workout);

    //Hide form + clear input fields
    this._hideForm();

    //Store workout in local Storage
    this._storeWorkout()
  }
  //Render workout on list

  _renderWorkoutMarker(workout) {
    console.log(workout);
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxwidth: 250,
          autoClose: false,
          closeOnClick: false,
          minWidth: 100,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type == 'runnning' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === 'running')
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }
  _moveToClick(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.#workout.find(el => el.id === workoutEl.dataset.id);
    console.log(workout);

    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    workout.click();
  }
  _storeWorkout(){
    localStorage.setItem("workouts", JSON.stringify(this.#workout)); 
  }
  _loadWorkout(){
    const data = JSON.parse(localStorage.getItem("workouts"))
    if(!data) return;
    this.#workout = data;
    this.#workout.forEach(work => 
      this._renderWorkout(work)
    )

    
  }

  reset(){
    localStorage.removeItem('workouts');
    location.reload()
  }
}
const app = new App();
// console.log(run1);
