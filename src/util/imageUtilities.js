import { reject } from "q";
import { resolve } from "dns";

export default class ImageUtilities {
  static async getOrientationAsync(file) {
    let reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = e => {
        let view = new DataView(e.target.result);
        if (view.getUint16(0, false) !== 0xffd8) {
          resolve(-2);
        }
        let length = view.byteLength,
          offset = 2;
        while (offset < length) {
          if (view.getUint16(offset + 2, false) <= 8) resolve(-1);
          let marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xffe1) {
            if (view.getUint32((offset += 2), false) !== 0x45786966) {
              resolve(-1);
            }

            let little = view.getUint16((offset += 6), false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            let tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + i * 12, little) === 0x0112) {
                resolve(view.getUint16(offset + i * 12 + 8, little));
              }
            }
          } else if ((marker & 0xff00) !== 0xff00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(-1);
      };

      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing image input file"));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
