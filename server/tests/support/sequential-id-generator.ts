import IdGenerator from '#src/application/ports/id-generator';

export default class SequentialIdGenerator implements IdGenerator {
  private count = 0;

  generate = (): string => `p${++this.count}`;
}
