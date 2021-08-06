// const bc = new BroadcastChannel('video_channel');
// bc.onmessage =  (ev) => { console.log(ev); };

onmessage = (e) => {
  const workerResult = 'Result: ' + (e);
  postMessage(workerResult);
};
//
// function VideoCallPickedUp(data) {
//   bc.postMessage(data);
// }
