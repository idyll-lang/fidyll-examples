

const { getVideoDurationInSeconds } = require('get-video-duration');

(async () => {
  const _inputDuration = 1000 * await getVideoDurationInSeconds('input-video-26.mp4');

  console.log(_inputDuration);
})()