import { invoke } from "@tauri-apps/api/tauri";
import { action, makeObservable, observable, runInAction } from "mobx";

export class DirsDataMobx {
    constructor() {
        makeObservable(this)
    }

    @observable
    dirsData: Dir[] = [];

    @action
    addItem(item: any) {
        this.dirsData.push(item);
    }

    @action
    clean() {
        this.dirsData = []
    }

    @action
    readDir(searchedData: ProjectTargetAnalysis[]) {
        this.dirsData = searchedData.map((e, i) => ({
            id: i.toString(),
            name: e.project_path.split("/").pop() ?? "unknown",
            path: e.project_path,
            size: e.size,
            timestamp: e.last_modified.secs_since_epoch
        }));
        console.log("setting done : ", this.dirsData);
        this.sort_size("Large_To_Small");
    }

    async remove(itemId: string) {
        const index = this.dirsData.findIndex(e => e.id === itemId);
        console.log('index', index, this.dirsData[index].path);
        const removeItemReturn = await invoke<RemoveItemReturn>("remove_item", { removePath: this.dirsData[index].path })
        runInAction(() => {
            if (!removeItemReturn.result) {
                console.log("fail");
            } else {
                this.dirsData.splice(index, 1);
            }
        })
    }

    @action
    sort_time(order: "Large_To_Small" | "Small_To_Large") {
        order == "Large_To_Small" ? this.dirsData.sort((a, b) => b.timestamp - a.timestamp)
            : this.dirsData.sort((a, b) => a.timestamp - b.timestamp)
    }

    @action
    sort_size(order: "Large_To_Small" | "Small_To_Large") {
        order == "Large_To_Small" ? this.dirsData.sort((a, b) => b.size - a.size)
            : this.dirsData.sort((a, b) => a.size - b.size)
    }

}

export const dirsDataMobx = new DirsDataMobx()

export type Dir = {
    id: string, path: string, name: string, size: number, timestamp: number
}
export type ProjectTargetAnalysis = {
    project_path: string,
    size: number,
    last_modified: { nanos_since_epoch: number, secs_since_epoch: number },
    selected_for_cleanup: boolean
}
export type RemoveItemReturn = {
    result: boolean,
    message: string
}
export type SortType = "Large_To_Small" | "Small_To_Large"
