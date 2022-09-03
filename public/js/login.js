import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "You have successfully logged in");
      window.setTimeout(() => {
        window.location.assign("/");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async function () {
  try {
    const res = await axios({
      method: "GET",
      url: "http://127.0.0.1:8000/api/v1/users/logout",
    });

    if (res.data.status === "success") {
      showAlert("success", "You have been logged out");
      window.location.reload(true);
      window.location.assign("/");
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again");
  }
};
