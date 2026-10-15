import { describe, expect, it } from 'vitest';

import Project, { ProjectStatus } from '#src/domain/project';
import { ProjectError } from '#src/domain/project-error';
import { expectErr, expectOk } from '#tests/support/result';

const address = {
  street: '123 Main St',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
};

const validParams = {
  name: 'Furnace install',
  status: ProjectStatus.Lead,
  dueDate: '2026-11-15',
  address,
  advisorId: 'advisor-1',
};

describe('Project.create', () => {
  it('trims string fields and keeps a valid project', () => {
    const project = expectOk(
      Project.create({
        name: '  Furnace install  ',
        status: ProjectStatus.Quoted,
        dueDate: '2026-11-15',
        address: {
          street: '  123 Main St  ',
          city: '  Austin  ',
          state: '  TX  ',
          postalCode: '  78701  ',
        },
        advisorId: '  advisor-1  ',
      })
    );

    expect(project).toMatchObject({
      name: 'Furnace install',
      status: ProjectStatus.Quoted,
      dueDate: '2026-11-15',
      address: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
      },
      advisorId: 'advisor-1',
    });
    expect(project.id).toBeUndefined();
  });

  it.each(['', '   '])('rejects the empty name %j', (name) => {
    const failure = expectErr(Project.create({ ...validParams, name }));

    expect(failure.type).toBe(ProjectError.ProjectNameEmpty);
  });

  it('rejects an unknown status', () => {
    const failure = expectErr(
      Project.create({ ...validParams, status: 'pending' })
    );

    expect(failure.type).toBe(ProjectError.InvalidProjectStatus);
  });

  it.each(['2026-13-01', '2026-02-30', '11/15/2026', '2026-11-15T00:00:00Z'])(
    'rejects the invalid due date %j',
    (dueDate) => {
      const failure = expectErr(Project.create({ ...validParams, dueDate }));

      expect(failure.type).toBe(ProjectError.InvalidDueDate);
    }
  );

  it('rejects an incomplete address', () => {
    const failure = expectErr(
      Project.create({
        ...validParams,
        address: { ...address, city: '  ' },
      })
    );

    expect(failure.type).toBe(ProjectError.AddressIncomplete);
  });

  it.each(['', '   '])('rejects the empty advisor id %j', (advisorId) => {
    const failure = expectErr(Project.create({ ...validParams, advisorId }));

    expect(failure.type).toBe(ProjectError.AdvisorIdEmpty);
  });
});

describe('Project.update', () => {
  it('applies partial changes and keeps the id', () => {
    const project = new Project({
      id: 'project-1',
      ...validParams,
      status: ProjectStatus.Lead,
    });

    const updated = expectOk(
      project.update({
        name: '  Heat pump  ',
        status: ProjectStatus.Scheduled,
      })
    );

    expect(updated).toMatchObject({
      id: 'project-1',
      name: 'Heat pump',
      status: ProjectStatus.Scheduled,
      dueDate: '2026-11-15',
      advisorId: 'advisor-1',
    });
  });

  it('rejects invalid changes', () => {
    const project = expectOk(Project.create(validParams));

    const failure = expectErr(project.update({ dueDate: 'not-a-date' }));

    expect(failure.type).toBe(ProjectError.InvalidDueDate);
  });
});
