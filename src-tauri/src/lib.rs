use crossbeam_channel::Sender;
use serde::Serialize;
use std::{
    path::{Path, PathBuf},
    time::SystemTime,
};
use tauri::Window;

pub struct Job(pub PathBuf, pub Sender<Job>);
pub struct ProjectDir(pub PathBuf, pub bool);

#[derive(Serialize, Debug)]
pub struct ProjectTargetAnalysis {
    /// The path of the project without the `target` directory suffix
    pub project_path: PathBuf,
    /// The size in bytes that the target directory takes up
    pub size: u64,
    /// The timestamp of the last recently modified file in the target directory
    pub last_modified: SystemTime,
    /// Indicate that this target directory should be cleaned
    pub selected_for_cleanup: bool,
}

impl ProjectTargetAnalysis {
    /// Analyze a given project directories target directory
    pub fn analyze(path: &Path) -> Self {
        let (size, last_modified) = Self::recursive_scan_target(&path.join("target"));
        Self {
            project_path: path.to_owned(),
            size,
            last_modified,
            selected_for_cleanup: false,
        }
    }

    // Recursively sum up the file sizes and find the last modified timestamp
    fn recursive_scan_target<T: AsRef<Path>>(path: T) -> (u64, SystemTime) {
        let path = path.as_ref();

        let default = (0, SystemTime::UNIX_EPOCH);

        if !path.exists() {
            return default;
        }

        match (path.is_file(), path.metadata()) {
            (true, Ok(md)) => (md.len(), md.modified().unwrap_or(default.1)),
            _ => path
                .read_dir()
                .map(|rd| {
                    rd.filter_map(|it| it.ok().map(|it| it.path()))
                        .map(Self::recursive_scan_target)
                        .fold(default, |a, b| (a.0 + b.0, a.1.max(b.1)))
                })
                .unwrap_or(default),
        }
    }
}

pub fn find_cargo_projects(
    window: Window,
    path: &Path,
    mut num_threads: usize,
    verbose: bool,
) -> Vec<ProjectDir> {
    if num_threads == 0 {
        num_threads = num_cpus::get();
    }

    {
        // job for what ? -> 将一个元组Job实例 "Job(path.to_path_buf(), job_tx)" 发送到线程开始处理
        // 在对于job_rx, 在线程代码中编写了job_rx的行为
        // 那么从代码顺序的角度来看，简单来说，先声明在线程的处理过程，然后在job_tx这里激活运行("send()")并附带了参数
        let (job_tx, job_rx) = crossbeam_channel::unbounded::<Job>();
        let (result_tx, result_rx) = crossbeam_channel::unbounded::<ProjectDir>();
        let (progress_tx, progress_rx) = crossbeam_channel::unbounded::<Payload>();

        (0..num_threads)
            .map(|_| (job_rx.clone(), result_tx.clone(), progress_tx.clone()))
            .for_each(|(job_rx, result_tx, progress_tx)| {
                std::thread::spawn(move || {
                    job_rx.into_iter().for_each(|job| {
                        find_cargo_projects_task(
                            job,
                            result_tx.clone(),
                            progress_tx.clone(),
                            verbose,
                        )
                    })
                });
            });

        job_tx
            .clone()
            .send(Job(path.to_path_buf(), job_tx))
            .unwrap();

        // 在主线程中接收来自工作线程的数据并调用 window.emit
        std::thread::spawn(move || {
            for progress in progress_rx {
                window.emit("PROGRESS", progress).unwrap();
            }
        });

        result_rx
    }
    .into_iter()
    .collect()
}
#[derive(Clone, Serialize)]
pub struct Payload {
    message: String,
}
pub fn find_cargo_projects_task(
    job: Job,
    results: Sender<ProjectDir>,
    progress: Sender<Payload>,
    verbose: bool,
) {
    let path = job.0;
    let job_sender = job.1;
    let mut has_target = false;

    let read_dir = match path.read_dir() {
        Ok(it) => it,
        Err(e) => {
            verbose.then(|| eprintln!("Error reading directory: '{}'  {}", path.display(), e));
            return;
        }
    };

    let (dirs, files): (Vec<_>, Vec<_>) = read_dir
        .filter_map(|it| it.ok().map(|it| it.path()))
        .partition(|it| it.is_dir());

    let has_cargo_toml = files
        .iter()
        .any(|it| it.file_name().unwrap_or_default().to_string_lossy() == "Cargo.toml");

    // Iterate through the subdirectories of path, ignoring entries that caused errors
    for it in dirs {
        let filename = it.file_name().unwrap_or_default().to_string_lossy();
        match filename.as_ref() {
            // No need to search .git directories for cargo projects. Also skip .cargo directories
            // as there shouldn't be any target dirs in there. Even if there are valid target dirs,
            // they should probably not be deleted. See issue #2 (https://github.com/dnlmlr/cargo-clean-all/issues/2)
            ".git" | ".cargo" | "node_modules"=> (),
            "target" if has_cargo_toml => has_target = true,
            // For directories queue a new job to search it with the threadpool
            _ => job_sender
                .send(Job(it.to_path_buf(), job_sender.clone()))
                .unwrap(),
        }
    }

    // If path contains a Cargo.toml, it is a project directory
    if has_cargo_toml {
        results.send(ProjectDir(path.clone(), has_target)).unwrap();

        progress
            .send(Payload {
                message: path.to_string_lossy().to_string(),
            })
            .unwrap();
    }
}
