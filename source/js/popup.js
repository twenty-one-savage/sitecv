var form = document.querySelector("form");
var popupFailure = document.querySelector(".popup-failure");
var popupSuccess = document.querySelector(".popup-success");
var closeFailure = popupFailure.querySelector(".popup-failure__button");
var closeSuccess = popupSuccess.querySelector(".popup-success__button");
var phoneNumber = document.querySelector(".contacts__input--phone");
var email = document.querySelector(".contacts__input--mail");
var firstName = document.querySelector(".fullname__input--name");
var surname = document.querySelector(".fullname__input--surname");

var isStorageSupport = true;
var storage = "";

try {
  storage = localStorage.getItem("phoneNumber");
} catch (err) {
  isStorageSupport = false;
}

form.addEventListener("submit", function (evt) {
  if (!phoneNumber.value || !email.value || !firstName.value || !surname.value) {
    evt.preventDefault();
    popupFailure.classList.remove("popup-show--error");
    popupFailure.offsetWidth = popupFailure.offsetWidth;
    popupFailure.classList.add("popup-show--error");
    phoneNumber.classList.add("error");
    email.classList.add("error");
    firstName.classList.add("error");
    surname.classList.add("error");
    console.log("Введите номер телефона, Ваше имя, фамилию, электронную почту");
  } else {
    evt.preventDefault();
    popupSuccess.classList.add("popup-show");
    if (isStorageSupport) {
      localStorage.setItem("phoneNumber, phoneNumber.value");
    }
  }
});

closeFailure.addEventListener("click", function (evt) {
  evt.preventDefault();
  popupFailure.classList.remove("popup-show--error");
});

closeSuccess.addEventListener("click", function (evt) {
  evt.preventDefault();
  popupSuccess.classList.remove("popup-show");
});

window.addEventListener("keydown", function (evt) {
  if (evt.keyCode === 27) {
    evt.preventDefault();
    if (popupFailure.classList.contains("popup-show--error")) {
      popupFailure.classList.remove("popup-show--error");
    }
  }
});

window.addEventListener("keydown", function (evt) {
  if (evt.keyCode === 27) {
    evt.preventDefault();
    if (popupSuccess.classList.contains("popup-show")) {
      popupSuccess.classList.remove("popup-show");
    }
  }
});
