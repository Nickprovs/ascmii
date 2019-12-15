export default class WebRtcUtilities {
  /**
   * Gets the next video input based on the current video input id.
   * @access public
   * @param {string} currentVideoInputId The current video input id. May provide undefined value if no current exists.
   * @return {string} The next video input via index based on the current video input... or the video input at index 0 if none provided.
   */
  static async getNextVideoInputIdAsync(currentVideoInputId) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === "videoinput");

    //Return first in list if current isn't passed
    if (!currentVideoInputId) return videoDevices[0].deviceId;

    //Try and get the next video input device via index of current + 1
    const currentDeviceInDeviceList = videoDevices.filter(
      d => d.deviceId === currentVideoInputId
    )[0];
    if (!currentDeviceInDeviceList) return videoDevices[0].deviceId;
    const currentIndex = videoDevices.indexOf(currentDeviceInDeviceList);
    const nextDevice = videoDevices[currentIndex + 1];
    if (!nextDevice) return videoDevices[0].deviceId;

    return nextDevice.deviceId;
  }
}
