import "@babel/polyfill";
import { displayMap } from "./mapbox";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import bookTour from "./stripe";

// DOM ELEMENTS
const loginForm = document.querySelector(".form--login");
const logoutOutBtn = document.querySelector(".nav__el--logout");
const updateUserForm = document.querySelector(".form-user-data");
const updatePasswordForm = document.querySelector(".form-user-password");
const bookTourBtn = document.getElementById("book-tour");
const mapBox = document.getElementById("map");

if (mapBox) {
  const locations = JSON.parse(
    document.getElementById("map").dataset.locations
  );
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    login(email, password);
  });
}

if (logoutOutBtn) {
  logoutOutBtn.addEventListener("click", function (e) {
    e.preventDefault();

    logout();
  });
}

if (updateUserForm) {
  updateUserForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "data");
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    document.querySelector(".btn-save-password").textContent = "updating...";

    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );

    document.querySelector(".btn-save-password").textContent = "save password";

    updatePasswordForm.reset();
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const { tourId } = e.target.dataset;

    e.target.textContent = "processing..";
    await bookTour(tourId);

    e.target.textContent = "Book tour now!";
  });
}
