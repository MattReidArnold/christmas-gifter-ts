import { Failure } from '#src/domain/shared/failure';
import { Result, err, ok } from '#src/domain/shared/result';
import {
  ProjectValidationError,
  addressIncompleteFailure,
  advisorIdEmptyFailure,
  invalidDueDateFailure,
  invalidProjectStatusFailure,
  projectNameEmptyFailure,
} from '#src/domain/project-error';

export enum ProjectStatus {
  Lead = 'lead',
  Quoted = 'quoted',
  Scheduled = 'scheduled',
  Installed = 'installed',
  Lost = 'lost',
}

export const PROJECT_STATUSES = Object.values(ProjectStatus);

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface ProjectParams {
  id?: string;
  name: string;
  status: ProjectStatus;
  dueDate: string;
  address: Address;
  advisorId: string;
}

export interface NewProjectParams {
  name: string;
  status: string;
  dueDate: string;
  address: AddressInput;
  advisorId: string;
}

export interface ProjectChanges {
  name?: string;
  status?: string;
  dueDate?: string;
  address?: AddressInput;
  advisorId?: string;
}

type ProjectResult = Result<Project, Failure<ProjectValidationError>>;

export default class Project {
  readonly id?: string;
  readonly name: string;
  readonly status: ProjectStatus;
  readonly dueDate: string;
  readonly address: Address;
  readonly advisorId: string;

  // Rehydrates an existing project without validation; use `create` for new projects.
  constructor({
    id,
    name,
    status,
    dueDate,
    address,
    advisorId,
  }: ProjectParams) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.dueDate = dueDate;
    this.address = address;
    this.advisorId = advisorId;
  }

  static create(params: NewProjectParams): ProjectResult {
    return Project.fromFields(undefined, params);
  }

  update(changes: ProjectChanges): ProjectResult {
    return Project.fromFields(this.id, {
      name: changes.name ?? this.name,
      status: changes.status ?? this.status,
      dueDate: changes.dueDate ?? this.dueDate,
      address: changes.address ?? this.address,
      advisorId: changes.advisorId ?? this.advisorId,
    });
  }

  private static fromFields(
    id: string | undefined,
    {
      name,
      status,
      dueDate,
      address,
      advisorId,
    }: NewProjectParams
  ): ProjectResult {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return err(projectNameEmptyFailure());
    }

    const parsedStatus = parseProjectStatus(status);
    if (!parsedStatus) {
      return err(invalidProjectStatusFailure(status));
    }

    const normalizedDueDate = normalizeDueDate(dueDate);
    if (!normalizedDueDate) {
      return err(invalidDueDateFailure());
    }

    const normalizedAddress = normalizeAddress(address);
    if (!normalizedAddress) {
      return err(addressIncompleteFailure());
    }

    const trimmedAdvisorId = advisorId.trim();
    if (!trimmedAdvisorId) {
      return err(advisorIdEmptyFailure());
    }

    return ok(
      new Project({
        id,
        name: trimmedName,
        status: parsedStatus,
        dueDate: normalizedDueDate,
        address: normalizedAddress,
        advisorId: trimmedAdvisorId,
      })
    );
  }
}

export const parseProjectStatus = (status: string): ProjectStatus | null =>
  PROJECT_STATUSES.includes(status as ProjectStatus)
    ? (status as ProjectStatus)
    : null;

const normalizeAddress = (address: AddressInput): Address | null => {
  const street = address.street.trim();
  const city = address.city.trim();
  const state = address.state.trim();
  const postalCode = address.postalCode.trim();
  if (!street || !city || !state || !postalCode) {
    return null;
  }
  return { street, city, state, postalCode };
};

const normalizeDueDate = (dueDate: string): string | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
};
