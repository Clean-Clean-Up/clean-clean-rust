import React, { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { observer } from 'mobx-react-lite';
import { dirsDataMobx, ProjectTargetAnalysis } from '../mobx/list-data';

export const PathInput = observer(() => {

    async function enterDir(basePath: string) {
        const res: ProjectTargetAnalysis[] = await invoke("enter_dir", { basePath })
        console.log('enterDir', res);
        dirsDataMobx.readDir(res);
    }

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
