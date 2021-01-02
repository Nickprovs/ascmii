const lightAsciiCharacterPalette = " .,:;i1tfLCG08@".split("");
const darkAsciiCharacterPalette = "@80GCLft1i;:,. ".split("");

export default class AsciiUtilities {
  static getRealisticDimensionForFittedAsciiText(width, height) {
    const MAXIMUM_WIDTH = 187.5;
    const MAXIMUM_HEIGHT = 140;

    if (height > MAXIMUM_HEIGHT) {
      const reducedWidth = Math.floor((width * MAXIMUM_HEIGHT) / height);
      return { width: reducedWidth, height: MAXIMUM_HEIGHT };
    }

    if (width > MAXIMUM_WIDTH) {
      const reducedHeight = Math.floor((height * MAXIMUM_WIDTH) / width);
      return { width: MAXIMUM_WIDTH, height: reducedHeight };
    }

    return { width: width, height: height };
  }

  static getFormattedAsciiCharactersFromCanvasImageData(canvasImageData, contrast = 128, useDarkPalette = false) {
    let ascii = "";
    const asciiCharacterPalette = useDarkPalette ? darkAsciiCharacterPalette : lightAsciiCharacterPalette;

    for (let i = 0; i < canvasImageData.data.length; i += 4) {
      const r = canvasImageData.data[i];
      const g = canvasImageData.data[i + 1];
      const b = canvasImageData.data[i + 2];
      const a = canvasImageData.data[i + 3];
      const unformattedPixel = { r, g, b, a };

      const contrastedPixel = this.getContrastedPixelFromPixelAndContrast(unformattedPixel, contrast);
      const pixelBrightness = this.getPixelBrightnessFromPixel(contrastedPixel);
      let nextAsciiCharacter = this.getAsciiCharacterFromPixelBrightnessAndPalette(
        pixelBrightness,
        asciiCharacterPalette
      );
      const pixelIndex = Math.ceil((i + 1) / 4);

      if (this.reachedEndOfRow(pixelIndex, canvasImageData.width)) {
        nextAsciiCharacter += "\n";

        if (this.reachedLineSkipIndex(pixelIndex, canvasImageData.width)) i = i + canvasImageData.width * 4;
      }

      ascii = ascii + nextAsciiCharacter;
    }

    return ascii;
  }

  static reachedEndOfRow(pixelIndex, rowWidth) {
    const endOfRow = pixelIndex !== 0 && pixelIndex % rowWidth === 0;
    return endOfRow;
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

  static getAsciiCharacterFromPixelBrightnessAndPalette(pixelBrightness, asciiCharacterPalette) {
    const paletteEndIndex = asciiCharacterPalette.length - 1;
    var nextCharacterIndexInPalette = paletteEndIndex - Math.round(pixelBrightness * paletteEndIndex);
    return asciiCharacterPalette[nextCharacterIndexInPalette];
  }
}
