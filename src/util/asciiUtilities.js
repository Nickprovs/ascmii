const asciiCharacterPalette = " .,:;i1tfLCG08@".split("");

export default class AsciiUtilities {
  static getFormattedAsciiCharactersFromCanvasImageData(
    canvasImageData,
    contrast = 128
  ) {
    // calculate contrast factor
    // http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
    var contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    let ascii = "";

    for (let i = 0; i < canvasImageData.data.length; i += 4) {
      const r = canvasImageData.data[i];
      const g = canvasImageData.data[i + 1];
      const b = canvasImageData.data[i + 2];
      const a = canvasImageData.data[i + 3];
      var contrastedColor = {
        red: this.bound(Math.floor((r - 128) * contrastFactor) + 128, [0, 255]),
        green: this.bound(Math.floor((g - 128) * contrastFactor) + 128, [
          0,
          255
        ]),
        blue: this.bound(Math.floor((b - 128) * contrastFactor) + 128, [
          0,
          255
        ]),
        alpha: a.alpha
      };

      var brightness =
        (0.299 * contrastedColor.red +
          0.587 * contrastedColor.green +
          0.114 * contrastedColor.blue) /
        255;

      var nextCharacter =
        asciiCharacterPalette[
          asciiCharacterPalette.length -
            1 -
            Math.round(brightness * (asciiCharacterPalette.length - 1))
        ];

      const pixelNum = Math.ceil((i + 1) / 4);
      if (i !== 0 && pixelNum % canvasImageData.width === 0) {
        //Skip every other line
        if (
          window.matchMedia("(orientation: landscape)").matches &&
          pixelNum % (3 * canvasImageData.width) === 0
        ) {
          let newI = i + canvasImageData.width * 4;
          i = newI;
        }

        nextCharacter += "\n";
      }

      ascii = ascii + nextCharacter;
    }

    return ascii;
  }

  static bound(value, interval) {
    return Math.max(interval[0], Math.min(interval[1], value));
  }
}
