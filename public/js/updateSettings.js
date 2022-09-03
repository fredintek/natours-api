import axios from "axios";
import { showAlert } from "./alert";

export const updateSettings = async function (data, type) {
  try {
    const url =
      type === "password"
        ? "http://127.0.0.1:8000/api/v1/users/updatePassword"
        : "http://127.0.0.1:8000/api/v1/users/updateData";
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
      window.setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.message);
  }
};
