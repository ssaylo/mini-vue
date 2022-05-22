const queue: any[] = [];

let isFlushPending = false;

export function queueJobs(job: any) {
  if(queue.indexOf(job) === -1) {
    queue.push(job);
  }
  queueFlush();
}

function queueFlush() {

  if(isFlushPending) return;

  isFlushPending = true;

  Promise.resolve().then(() => {
    isFlushPending = false;

    let job;
    while (job = queue.shift()) {
      job && job();
    }
  })
}
