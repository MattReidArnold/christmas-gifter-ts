import { Request, Response, NextFunction } from 'express';

import {
  AddressInput,
  NewProjectParams,
  ProjectChanges,
  ProjectStatus,
  parseProjectStatus,
} from '#src/domain/project';
import {
  ProjectError,
  invalidProjectStatusFailure,
  invalidSortFailure,
} from '#src/domain/project-error';
import { Failure } from '#src/domain/shared/failure';
import Logger from '#src/application/ports/logger';
import { ProjectSort } from '#src/application/ports/project-repository';
import { CreateProjectUseCase } from '#src/application/use-cases/create-project';
import { DeleteProjectUseCase } from '#src/application/use-cases/delete-project';
import { GetProjectUseCase } from '#src/application/use-cases/get-project';
import { ListProjectsUseCase } from '#src/application/use-cases/list-projects';
import { ProjectUseCaseError } from '#src/application/use-cases/project-failures';
import { UpdateProjectUseCase } from '#src/application/use-cases/update-project';

type ProjectControllerDeps = {
  logger: Logger;
  createProject: CreateProjectUseCase;
  getProject: GetProjectUseCase;
  listProjects: ListProjectsUseCase;
  updateProject: UpdateProjectUseCase;
  deleteProject: DeleteProjectUseCase;
};

type ProjectParams = { projectId: string };

type ProjectFailure = Failure<ProjectUseCaseError | ProjectError>;

const statusForFailure = ({ type }: ProjectFailure): number => {
  switch (type) {
    case ProjectUseCaseError.ProjectNotFound:
      return 404;
    case ProjectUseCaseError.ProjectSaveFailed:
      return 500;
    case ProjectError.ProjectNameEmpty:
    case ProjectError.InvalidProjectStatus:
    case ProjectError.InvalidDueDate:
    case ProjectError.AddressIncomplete:
    case ProjectError.AdvisorIdEmpty:
    case ProjectError.InvalidSort:
      return 422;
    default: {
      const unhandled: never = type;
      throw new Error(`No HTTP status mapped for failure ${unhandled}`);
    }
  }
};

const sendFailure = (res: Response, failure: ProjectFailure) =>
  res.status(statusForFailure(failure)).send({ failure });

const stringOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const emptyAddress = (): AddressInput => ({
  street: '',
  city: '',
  state: '',
  postalCode: '',
});

const addressFromBody = (value: unknown): AddressInput | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const body = value as Record<string, unknown>;
  return {
    street: stringOrUndefined(body.street) ?? '',
    city: stringOrUndefined(body.city) ?? '',
    state: stringOrUndefined(body.state) ?? '',
    postalCode: stringOrUndefined(body.postalCode) ?? '',
  };
};

const createParamsFromBody = (body: unknown): NewProjectParams => {
  const record =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  return {
    name: stringOrUndefined(record.name) ?? '',
    status: stringOrUndefined(record.status) ?? '',
    dueDate: stringOrUndefined(record.dueDate) ?? '',
    address: addressFromBody(record.address) ?? emptyAddress(),
    advisorId: stringOrUndefined(record.advisorId) ?? '',
  };
};

const changesFromBody = (body: unknown): ProjectChanges => {
  const record =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const changes: ProjectChanges = {};
  if ('name' in record) {
    changes.name = stringOrUndefined(record.name) ?? '';
  }
  if ('status' in record) {
    changes.status = stringOrUndefined(record.status) ?? '';
  }
  if ('dueDate' in record) {
    changes.dueDate = stringOrUndefined(record.dueDate) ?? '';
  }
  if ('address' in record) {
    changes.address = addressFromBody(record.address) ?? emptyAddress();
  }
  if ('advisorId' in record) {
    changes.advisorId = stringOrUndefined(record.advisorId) ?? '';
  }
  return changes;
};

const parseStatuses = (
  value: unknown
):
  | { ok: true; value: ProjectStatus[] | undefined }
  | { ok: false; error: Failure<ProjectError.InvalidProjectStatus> } => {
  const raw = stringOrUndefined(value);
  if (!raw) {
    return { ok: true, value: undefined };
  }
  const statuses: ProjectStatus[] = [];
  for (const part of raw.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const status = parseProjectStatus(trimmed);
    if (!status) {
      return { ok: false, error: invalidProjectStatusFailure(trimmed) };
    }
    statuses.push(status);
  }
  return { ok: true, value: statuses.length > 0 ? statuses : undefined };
};

const parseSort = (
  value: unknown
):
  | { ok: true; value: ProjectSort }
  | { ok: false; error: Failure<ProjectError.InvalidSort> } => {
  const raw = stringOrUndefined(value);
  if (!raw || raw === 'dueDate') {
    return { ok: true, value: 'dueDate' };
  }
  if (raw === '-dueDate') {
    return { ok: true, value: '-dueDate' };
  }
  return { ok: false, error: invalidSortFailure(raw) };
};

const projectController = ({
  logger,
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
}: ProjectControllerDeps) => {
  const create = async (req: Request, res: Response, _next: NextFunction) => {
    const result = await createProject.execute(createParamsFromBody(req.body));
    if (!result.ok) {
      logger.info('failed to create project', JSON.stringify(result.error));
      return sendFailure(res, result.error);
    }
    const project = result.value;
    logger.info('project created', JSON.stringify(project));
    return res.status(201).send(project);
  };

  const list = async (req: Request, res: Response, _next: NextFunction) => {
    const statuses = parseStatuses(req.query.status);
    if (!statuses.ok) {
      return sendFailure(res, statuses.error);
    }
    const sort = parseSort(req.query.sort);
    if (!sort.ok) {
      return sendFailure(res, sort.error);
    }
    const projects = await listProjects.execute({
      statuses: statuses.value,
      advisorId: stringOrUndefined(req.query.advisorId),
      sort: sort.value,
    });
    return res.send(projects);
  };

  const find = async (
    req: Request<ProjectParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const result = await getProject.execute(req.params.projectId);
    if (!result.ok) {
      return sendFailure(res, result.error);
    }
    return res.send(result.value);
  };

  const update = async (
    req: Request<ProjectParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const result = await updateProject.execute(
      req.params.projectId,
      changesFromBody(req.body)
    );
    if (!result.ok) {
      logger.info('failed to update project', JSON.stringify(result.error));
      return sendFailure(res, result.error);
    }
    return res.send(result.value);
  };

  const remove = async (
    req: Request<ProjectParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const { projectId } = req.params;
    const result = await deleteProject.execute(projectId);
    if (!result.ok) {
      logger.info('failed to delete project', JSON.stringify(result.error));
      return sendFailure(res, result.error);
    }
    logger.info('project deleted', projectId);
    return res.status(204).send();
  };

  return {
    create,
    list,
    find,
    update,
    remove,
  };
};

export default projectController;
