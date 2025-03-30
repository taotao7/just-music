import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import { AudioPlayerProvider } from "react-use-audio-player";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AudioPlayerProvider>
    <App />
  </AudioPlayerProvider>
);
