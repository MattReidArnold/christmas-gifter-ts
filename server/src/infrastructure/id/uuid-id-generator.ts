import { randomUUID } from 'node:crypto';

import IdGenerator from '#src/application/ports/id-generator';

const uuidIdGenerator = (): IdGenerator => ({
  generate: () => randomUUID(),
});

export default uuidIdGenerator;
