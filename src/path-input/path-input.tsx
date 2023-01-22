import React, { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { observer } from 'mobx-react-lite';
import { dirsDataMobx, ProjectTargetAnalysis } from '../mobx/list-data';
import { appWindow } from '@tauri-apps/api/window';
import { loadingMobx } from '../mobx/loading';

export const PathInput = observer(() => {

    async function openFile() {
        const file = await open({
            multiple: false,
            directory: true,
        });
        if (typeof file != 'string') {
            // No file given (also file won't be an array of strings here since multiple is false)
            return;
        }
        console.log('file', file)
        enterDir(file);
    }

    function enterDir(basePath: string) {
        loadingMobx.load()
        invoke<ProjectTargetAnalysis[]>("enter_dir", { basePath, window: appWindow })
            .then((res: ProjectTargetAnalysis[]) => {
                console.log('enterDir', res);
                dirsDataMobx.readDir(res);
                loadingMobx.loaded()
            })
    }

    return (
        <div>
            <button onClick={openFile}
                style={{
                    width: "200px",
                }}
            > Open Folder </button>
        </div>
    )
})
