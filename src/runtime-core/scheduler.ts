const queue: any[] = [];

let isFlushPending = false;

export function queueJobs(job: any) {
  if(queue.indexOf(job) === -1) {
    queue.push(job);
  }
  queueFlush();
}

function flashJobs() {
  isFlushPending = false;

  let job;
  while (job = queue.shift()) {
    job && job();
  }
}

function queueFlush() {

  if(isFlushPending) return;

  isFlushPending = true;

  nextTick(flashJobs)
}

export function nextTick(fn: any) {
  return fn ? Promise.resolve().then(fn) : Promise.resolve();
}
