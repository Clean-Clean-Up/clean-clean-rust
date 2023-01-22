import React, { useEffect, useState } from 'react'
import { observer, useLocalStore, useObserver } from 'mobx-react-lite';
import List from 'react-virtualized/dist/commonjs/List';
import { ListItem } from './list-item';
import "../App.css";
import { dirsDataMobx, SortType } from '../mobx/list-data';
import { dataDir } from '@tauri-apps/api/path';
import Loading from '../loading/loading';
import { loadingMobx } from '../mobx/loading';

export const ListContainer = observer(
    () => {
        const [sizeOrder, setSizeOrder] = useState<SortType>("Large_To_Small");
        return (
            <div className="list-container">
                <div className="schame-panel">
                    <div className="schama-title-item-pn">project name</div>
                    <div className="schama-title-item-path">path</div>
                    <div className="schama-title-item-size">
                        <div>size</div>
                        <button onClick={() => {
                            const newState = sizeOrder == 'Large_To_Small' ? 'Small_To_Large' : 'Large_To_Small'
                            setSizeOrder(newState)
                            dirsDataMobx.sort_size(newState)
                        }}
                            className="size-sort-button"
                        >
                            {sizeOrder === 'Large_To_Small' ? "⬇️" : "⬆️"}
                        </button>
                    </div>
                </div>
                <div className='list-border'>
                    <List
                        height={200}
                        rowHeight={50}
                        rowCount={dirsDataMobx.dirsData.length}
                        width={600}
                        rowRenderer={
                            ({ index, key, style }: any) =>
                            (
                                <ListItem dirsData={dirsDataMobx.dirsData} index={index} key={key} style={style} />
                            )
                        }
                        className="list-component"
                    />
                </div>
            </div>
        )
    }
)
