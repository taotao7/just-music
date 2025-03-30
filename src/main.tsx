import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import { AudioPlayerProvider } from "react-use-audio-player";

// prevent right click
document.addEventListener("contextmenu", (event) => event.preventDefault());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AudioPlayerProvider>
    <App />
  </AudioPlayerProvider>
);
