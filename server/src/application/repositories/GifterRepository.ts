import Gifter from '../../entities/Gifter';

export default interface GifterRepository {
  getByName: (name: string) => Promise<Gifter | null>;
  add: (gifter: Gifter) => Promise<Gifter>;
}
