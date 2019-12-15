const asciiCharacterPalette = " .,:;i1tfLCG08@".split("");

export default class AsciiUtilities {
  static getFormattedAsciiCharactersFromCanvasImageData(canvasImageData, contrast = 128) {
    let ascii = "";

    for (let i = 0; i < canvasImageData.data.length; i += 4) {
      const r = canvasImageData.data[i];
      const g = canvasImageData.data[i + 1];
      const b = canvasImageData.data[i + 2];
      const a = canvasImageData.data[i + 3];
      const unformattedPixel = { r, g, b, a };

      const contrastedPixel = this.getContrastedPixelFromPixelAndContrast(unformattedPixel, contrast);
      const pixelBrightness = this.getPixelBrightnessFromPixel(contrastedPixel);
      let nextAsciiCharacter = this.getAsciiCharacterFromPixelBrightness(pixelBrightness);
      const pixelIndex = Math.ceil((i + 1) / 4);

      if (this.reachedEndOfRow(i, canvasImageData.width)) {
        nextAsciiCharacter += "\n";
        if (this.reachedLineSkipIndex(i, canvasImageData.width)) i = i + canvasImageData.width * 4;
      }

      ascii = ascii + nextAsciiCharacter;
    }

    return ascii;
  }

  static reachedEndOfRow(pixelIndex, rowWidth) {
    return pixelIndex !== 0 && pixelIndex % rowWidth === 0;
  }

  static reachedLineSkipIndex(pixelIndex, rowWidth) {
    return window.matchMedia("(orientation: landscape)").matches && pixelIndex % (3 * rowWidth) === 0;
  }

  static bound(value, interval) {
    return Math.max(interval[0], Math.min(interval[1], value));
  }

  static getContrastedPixelFromPixelAndContrast(pixel, contrast = 128) {
    // calculate contrast factor
    // http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
    var contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    return {
      red: this.bound(Math.floor((pixel.r - 128) * contrastFactor) + 128, [0, 255]),
      green: this.bound(Math.floor((pixel.g - 128) * contrastFactor) + 128, [0, 255]),
      blue: this.bound(Math.floor((pixel.b - 128) * contrastFactor) + 128, [0, 255]),
      alpha: pixel.a.alpha
    };
  }

  static getPixelBrightnessFromPixel(pixel) {
    return (0.299 * pixel.red + 0.587 * pixel.green + 0.114 * pixel.blue) / 255;
  }

  static getAsciiCharacterFromPixelBrightness(pixelBrightness) {
    const paletteEndIndex = asciiCharacterPalette.length - 1;
    var nextCharacterIndexInPalette = paletteEndIndex - Math.round(pixelBrightness * paletteEndIndex);
    return asciiCharacterPalette[nextCharacterIndexInPalette];
  }
}
