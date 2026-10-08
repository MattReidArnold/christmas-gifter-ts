import Gifter from '#src/domain/Gifter';

export default interface GifterRepository {
  getByName: (name: string) => Promise<Gifter | null>;
  add: (gifter: Gifter) => Promise<Gifter>;
  update: (gifter: Gifter) => Promise<Gifter | null>;
}
