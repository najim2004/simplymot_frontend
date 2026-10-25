import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CustomToastContainer() {
  return <ToastContainer theme="light" position="top-right" autoClose={4000} />;
}
