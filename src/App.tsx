import { CSSProperties, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import 'react-virtualized/styles.css';
import { PathInput } from "./path-input/path-input";
import { Dir } from "./mobx/list-data";
import { ListContainer } from "./list/list-container";

function App() {
  return (
    <div className="container">
      <h1>Clean Clean Up !</h1>
      <PathInput />
      <p>Below a List of Rust folder</p>
      <ListContainer />
      {/* <Loading/> */}
    </div >
  );
}

export default App;
