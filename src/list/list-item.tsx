import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Dir, dirsDataMobx } from '../mobx/list-data'
import "../App.css";
import { filesize } from "filesize";

export const ListItem = observer(
    ({ index, style }
        : {
            dirsData: Dir[],
            index: number,
            style: any
        }) => {
        useEffect(() => {
            dirsDataMobx.dirsData.forEach(e => {
                const pathElement = document.getElementById(e.id);
                pathElement?.scrollTo(pathElement.scrollWidth, 0);
            })
        }, [])
        const _path = dirsDataMobx.dirsData[index].path.split("/");
        const prefixPath = _path.slice(0, _path.length - 1).join("/");
        const basename = _path.pop();
        return (
            <div
                style={style}
                key={dirsDataMobx.dirsData[index].name}
            >
                <div className={`list-item-div theme-${index % 2 == 0 ? 'odd' : 'even'}`}>
                    <div className="project-name">
                        {dirsDataMobx.dirsData[index].name}
                    </div>
                    <div className="path" id={dirsDataMobx.dirsData[index].id}>
                        <span>{prefixPath}/</span>
                        <span className='enlarge-basename'>{basename}</span>
                    </div>
                    <button className='clear-button'
                        onClick={() => { dirsDataMobx.remove(dirsDataMobx.dirsData[index].id) }}
                    >clear</button>
                    <div className="size">
                        {filesize(dirsDataMobx.dirsData[index].size, { base: 2, standard: 'jedec' }).toString()}
                    </div>

                </div>
            </div>
        )
    }
)

