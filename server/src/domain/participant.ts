export interface ParticipantParams {
  id: string;
  name: string;
  exclusions: string[];
}

export default class Participant {
  readonly id: string;
  readonly name: string;
  // Ids of other participants in the same group this participant must not be matched with.
  readonly exclusions: string[];

  constructor({ id, name, exclusions }: ParticipantParams) {
    this.id = id;
    this.name = name;
    this.exclusions = exclusions;
  }
}
