export default class WebRtcUtilities {
  static async getNextVideoInputIdAsync(currentVideoInputId) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === "videoinput");

    //Return first in list if current isn't passed
    if (!currentVideoInputId) return videoDevices[0].deviceId;

    //Try and get the next video input device via index of current + 1
    const currentDeviceInDeviceList = videoDevices.filter(d => d.deviceId === currentVideoInputId)[0];
    if (!currentDeviceInDeviceList) return videoDevices[0].deviceId;
    const currentIndex = videoDevices.indexOf(currentDeviceInDeviceList);
    const nextDevice = videoDevices[currentIndex + 1];
    if (!nextDevice) return videoDevices[0].deviceId;

    return nextDevice.deviceId;
  }

  static stopStreamedVideo(videoElem) {
    let stream = videoElem.srcObject;
    let tracks = stream.getTracks();

    for (let track of tracks) {
      track.stop();
    }

    videoElem.srcObject = null;
  }

  static getFrameRateForMediaStream(mediaStream) {
    return mediaStream.getVideoTracks()[0].getSettings().frameRate;
  }
}
