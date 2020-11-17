export default class Gifter {
  constructor(
    public readonly name: string,
    public readonly id?: string,
    public readonly doNotGiftFrom?: Gifter[],
    public readonly giftTo?: Gifter
  ) {}
}
