'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcPace();
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
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
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
      {
      }
    ).addTo(this.#map);

    L.marker(coords).addTo(this.#map).bindPopup('Present Location').openPopup();

    //handling click on map
    this.#map.on('click', this._showForm.bind(this));
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
        this._renderWorkoutMarker(e, lat, lng);
        //If workout is running, create running object
        workout = new Running([lat, lng], distance, duration, cadence);
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
        console.log(workout);
        
        //Render workout on map as marker
        this._renderWorkoutMarker(e, lat, lng, workout);
      } else {
        //if valid is not validated
        return alert('Inputs have to be positive numbers!');
      }
    }

    //Add new object to workout array
    this.#workout.push(workout);
    console.log(typeof workout.type);


    //Hide form + clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.classList.add('hidden');
  }

  _renderWorkoutMarker(e, lat, lng, workout) {
    e.preventDefault();
    L.marker([lat, lng])
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
      .setPopupContent('Workout')
      .openPopup();
    //Render workout on list
  }
}
const run3 = new App();
// console.log(run1);
