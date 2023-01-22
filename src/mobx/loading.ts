import { invoke } from "@tauri-apps/api/tauri";
import { action, makeObservable, observable, runInAction } from "mobx";
import { appWindow } from '@tauri-apps/api/window';

export const unlistenProgress = await appWindow.listen(
    'PROGRESS',
    ({ event, payload }) => {
        loadingMobx.setMessage((payload as { message: string }).message);
    }
);

export class LoadingMobx {
    constructor() {
        makeObservable(this)
    }

    @observable
    isLoading: boolean = false

    @observable
    message: string = "";

    @action
    load() {
        this.isLoading = true;
    }

    @action
    loaded() {
        this.isLoading = false;
        this.message = ''
    }

    @action
    setMessage(s: string) {
        this.message = s
    }
}

export const loadingMobx = new LoadingMobx()
