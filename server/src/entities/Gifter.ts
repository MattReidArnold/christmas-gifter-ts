export interface GifterParams {
  id?: string;
  doNotGiftFrom: string[];
  giftTo?: string;
  name: string;
}
export default class Gifter {
  readonly name: string;
  readonly doNotGiftFrom: string[];
  readonly id?: string;
  readonly giftTo?: string;

  constructor({ id, doNotGiftFrom, giftTo, name }: GifterParams) {
    this.id = id;
    this.doNotGiftFrom = doNotGiftFrom;
    this.giftTo = giftTo;
    this.name = name;
  }
}
