import * as React from 'react';
import "./App.css";
import 'react-virtualized/styles.css';
import { PathInput } from "./path-input/path-input";
import { ListContainer } from "./list/list-container";
import { observer } from 'mobx-react-lite';
import { loadingMobx } from './mobx/loading';
import Loading from './loading/loading';


const App = observer(() => {
  return (
    <div className={'container'}>
      <div className={`${loadingMobx.isLoading ? 'container-blue' : ''}`}>
        <h1>Clean Clean Up !</h1>
        <PathInput />
        <p>Below a List of Rust folder</p>
        <ListContainer />
        <p className="foot-note">
          tool by
          <a href="https://github.com/weykon">
            weykon
          </a>
        </p>
      </div>
      <Loading />
    </div>
  );
})
export default App;
