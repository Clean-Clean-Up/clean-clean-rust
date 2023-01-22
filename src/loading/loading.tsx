import { observer } from 'mobx-react-lite';
import React from 'react';
import { loadingMobx } from '../mobx/loading';
import './loading.css';

const Loading = observer(() =>
    // true ?
        loadingMobx.isLoading ?
        <div className='loading-container'>
            <div className="loading-text">
                Loading
            </div>
            <div className='dot'>
                ...
            </div>
            <div className='loading-message'>
                {loadingMobx.message}
            </div>
        </div>
        : <></>
)

export default Loading;
