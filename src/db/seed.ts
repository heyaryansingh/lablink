import { addDays, subDays } from 'date-fns';
import { createDefaultConfig } from '../config/defaults';
import { connectDatabase, migrateDatabase, type LabLinkDatabase } from './connection';

const ids = {
  userAlex: 'user-alex',
  userJordan: 'user-jordan',
  userPark: 'user-park',
  userSam: 'user-sam',
  userRiley: 'user-riley',
  projectTau: 'project-tau',
  projectCrispr: 'project-crispr',
  projectImaging: 'project-imaging',
  projectBehavioral: 'project-behavioral',
  channelTau: 'channel-tau',
  channelGeneral: 'channel-general',
  meetingLab: 'meeting-lab-weekly',
  cage201: 'cage-4b-201',
  cage202: 'cage-4b-202',
};

export function seedDemoData(db: LabLinkDatabase): void {
  const userCount = db.raw.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const today = new Date();
  const isoDate = (date: Date) => date.toISOString().slice(0, 10);
  const iso = (date: Date) => date.toISOString();

  const tx = db.raw.transaction(() => {
    const userStmt = db.raw.prepare(
      'INSERT INTO users (id, name, email, role, certifications, equipment_trained, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    userStmt.run(ids.userAlex, 'Alex Kim', 'alex.kim@example.edu', 'grad_student', '["mouse_handling","confocal"]', '["equipment-confocal"]', 'active');
    userStmt.run(ids.userJordan, 'Jordan Lee', 'jordan.lee@example.edu', 'postdoc', '["perfusion","mouse_surgery"]', '[]', 'active');
    userStmt.run(ids.userPark, 'Dr. Mina Park', 'mina.park@example.edu', 'pi', '[]', '[]', 'active');
    userStmt.run(ids.userSam, 'Sam Rivera', 'sam.rivera@example.edu', 'technician', '["genotyping"]', '[]', 'active');
    userStmt.run(ids.userRiley, 'Riley Chen', 'riley.chen@example.edu', 'undergrad', '[]', '[]', 'away');

    const projectStmt = db.raw.prepare(
      'INSERT INTO projects (id, name, description, status, color, icon, ai_status_summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    projectStmt.run(ids.projectTau, 'Tau Pathology Study', 'Longitudinal tau pathology experiment with behavior, histology, and imaging readouts.', 'active', '#4ee1a0', 'T', 'On track, with reagent risk around AT8 antibody availability.');
    projectStmt.run(ids.projectCrispr, 'CRISPR Screen', 'Pooled perturbation screen to identify modifiers of protein aggregation.', 'active', '#7b93ff', 'C', 'At risk due to delayed library QC.');
    projectStmt.run(ids.projectImaging, 'Imaging Pipeline', 'Automated microscopy and segmentation workflow for cohort analysis.', 'active', '#ffd97b', 'I', 'Healthy, pending core facility booking.');
    projectStmt.run(ids.projectBehavioral, 'Behavioral Analysis', 'Open field and maze analysis for intervention cohorts.', 'active', '#ff7b93', 'B', 'Analysis tasks are due this week.');

    const memberStmt = db.raw.prepare(
      'INSERT INTO project_members (project_id, user_id, role, effort_percent, funding_source) VALUES (?, ?, ?, ?, ?)',
    );
    for (const projectId of [ids.projectTau, ids.projectCrispr, ids.projectImaging, ids.projectBehavioral]) {
      memberStmt.run(projectId, ids.userPark, 'PI', 20, 'NIH R01');
    }
    memberStmt.run(ids.projectTau, ids.userJordan, 'Project lead', 80, 'NIH R01');
    memberStmt.run(ids.projectTau, ids.userSam, 'Genotyping and colony', 50, 'NIH R01');
    memberStmt.run(ids.projectBehavioral, ids.userAlex, 'Analysis lead', 60, 'Training grant');

    const taskStmt = db.raw.prepare(
      'INSERT INTO tasks (id, project_id, assigned_to, created_by, title, description, status, priority, due_date, source_type, source_id, source_quote, tags, ai_priority_score, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    taskStmt.run('task-specific-aims', ids.projectTau, ids.userPark, ids.userPark, 'Submit R01 specific aims for internal review', 'Route the current aims page to collaborators before sponsor deadline.', 'todo', 'critical', isoDate(today), 'email', 'inbox-r01', 'Can you send the specific aims by Friday?', '["grant","deadline"]', 0.95, 0.98);
    taskStmt.run('task-order-at8', ids.projectTau, ids.userJordan, ids.userPark, 'Order anti-tau antibody AT8 or confirm substitute', 'AT8 is backordered. Confirm alternate vendor or clone.', 'blocked', 'high', isoDate(addDays(today, 1)), 'meeting', ids.meetingLab, 'Jordan will check alternate AT8 suppliers.', '["reagent"]', 0.78, 0.92);
    taskStmt.run('task-schedule-perfusion', ids.projectTau, ids.userJordan, ids.userPark, 'Schedule perfusion for cohort 2 mice', 'Coordinate room, backup technician, and tissue processing window.', 'todo', 'high', isoDate(addDays(today, 2)), 'meeting', ids.meetingLab, 'Perfusion for cohort 2 should happen Tuesday.', '["animals","procedure"]', 0.71, 0.9);
    taskStmt.run('task-open-field', ids.projectBehavioral, ids.userAlex, ids.userPark, 'Run behavioral analysis on open field data', 'Process raw cohort 1 tracking data and upload summary plots.', 'in_progress', 'medium', isoDate(addDays(today, 5)), 'meeting', ids.meetingLab, 'Alex will have the open field analysis done by Friday.', '["analysis"]', 0.54, 0.88);
    taskStmt.run('task-genotyping', ids.projectTau, ids.userSam, ids.userJordan, 'Enter genotyping results for cage 4B-207', 'Update control/cohort assignments after PCR results.', 'done', 'low', isoDate(subDays(today, 2)), 'manual', null, null, '["colony"]', 0.2, null);

    db.raw.prepare('INSERT INTO deadlines (id, project_id, title, type, due_date, status) VALUES (?, ?, ?, ?, ?, ?)').run(
      'deadline-r01',
      ids.projectTau,
      'NIH R01 submission',
      'grant_submission',
      isoDate(addDays(today, 19)),
      'upcoming',
    );

    db.raw.prepare('INSERT INTO channels (id, name, project_id, channel_type, description, members) VALUES (?, ?, ?, ?, ?, ?)').run(
      ids.channelTau,
      'tau-pathology',
      ids.projectTau,
      'project',
      'Project channel for tau pathology work',
      '[]',
    );
    db.raw.prepare('INSERT INTO channels (id, name, project_id, channel_type, description, members) VALUES (?, ?, ?, ?, ?, ?)').run(
      ids.channelGeneral,
      'general',
      null,
      'general',
      'Lab-wide announcements and coordination',
      '[]',
    );

    db.raw.prepare('INSERT INTO messages (id, channel_id, sender_id, content, message_type) VALUES (?, ?, ?, ?, ?)').run(
      'message-western-results',
      ids.channelTau,
      ids.userJordan,
      'Western results are in. I will upload the blot quantification today.',
      'text',
    );

    db.raw.prepare(
      'INSERT INTO meetings (id, title, meeting_type, date, duration_minutes, attendees, transcript, summary, action_items_extracted, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(
      ids.meetingLab,
      'Weekly Lab Meeting',
      'lab_meeting',
      iso(subDays(today, 4)),
      55,
      JSON.stringify([ids.userPark, ids.userAlex, ids.userJordan, ids.userSam]),
      'Dr. Park: Jordan will check alternate AT8 suppliers. Alex will have the open field analysis done by Friday.',
      'Discussed tau cohort readiness, AT8 backorder risk, and behavioral analysis due this week.',
      1,
      'completed',
    );

    const cageStmt = db.raw.prepare(
      'INSERT INTO cages (id, cage_number, room, rack, max_capacity, status, protocol_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    cageStmt.run(ids.cage201, '4B-201', 'BSB-142', 'A3', 5, 'active', 'IACUC-2024-0089');
    cageStmt.run(ids.cage202, '4B-202', 'BSB-142', 'A3', 5, 'active', 'IACUC-2024-0089');

    const animalStmt = db.raw.prepare(
      'INSERT INTO animals (id, project_id, identifier, species, strain, genotype, sex, date_of_birth, cage_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    animalStmt.run('animal-0147', ids.projectTau, 'M-2024-0147', 'mouse', 'APP/PS1', 'APP/PS1+', 'male', isoDate(subDays(today, 58)), ids.cage201, 'procedure_scheduled');
    animalStmt.run('animal-0148', ids.projectTau, 'M-2024-0148', 'mouse', 'APP/PS1', 'APP/PS1+', 'male', isoDate(subDays(today, 58)), ids.cage201, 'procedure_scheduled');
    animalStmt.run('animal-0149', ids.projectTau, 'M-2024-0149', 'mouse', 'APP/PS1', 'APP/PS1-', 'female', isoDate(subDays(today, 58)), ids.cage201, 'active');

    db.raw.prepare(
      'INSERT INTO procedures (id, animal_id, project_id, assigned_to, type, scheduled_date, scheduled_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).run('procedure-perfusion-0147', 'animal-0147', ids.projectTau, ids.userJordan, 'perfusion', isoDate(addDays(today, 2)), '09:00', 'scheduled');

    db.raw.prepare(
      'INSERT INTO documents (id, project_id, title, provider, external_url, mime_type, last_modified_at, last_modified_by, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run('doc-perfusion-protocol', ids.projectTau, 'Perfusion Protocol v3', 'google_drive', 'https://drive.example.edu/perfusion-protocol-v3', 'application/pdf', iso(subDays(today, 7)), 'Jordan Lee', '["protocol"]');

    db.raw.prepare(
      'INSERT INTO inbox_items (id, source, source_id, subject, preview, from_label, body, received_at, unread, project_id, confidence, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run('inbox-r01', 'Outlook', 'message-r01', 'R01 specific aims review', 'Please send the current aims page for review.', 'mina.park@example.edu', 'Can you send the specific aims by Friday?', iso(subDays(today, 1)), 1, ids.projectTau, 0.94, '{}');
    db.raw.prepare(
      'INSERT INTO inbox_items (id, source, source_id, subject, preview, from_label, body, received_at, unread, project_id, confidence, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run('inbox-collab', 'Gmail', 'message-collab', 'Collaboration inquiry', 'Interested in your imaging pipeline.', 'chen@example.edu', 'Could we discuss collaboration around your pipeline?', iso(subDays(today, 0)), 0, ids.projectImaging, 0.72, '{}');

    db.raw.prepare(
      "INSERT INTO search_index (entity_type, entity_id, content) SELECT 'task', id, title || ' ' || coalesce(description, '') FROM tasks",
    ).run();
    db.raw.prepare(
      "INSERT INTO search_index (entity_type, entity_id, content) SELECT 'project', id, name || ' ' || coalesce(description, '') FROM projects",
    ).run();
    db.raw.prepare(
      "INSERT INTO search_index (entity_type, entity_id, content) SELECT 'meeting', id, title || ' ' || coalesce(summary, '') FROM meetings",
    ).run();
  });

  tx();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = createDefaultConfig();
  const db = connectDatabase(config.dataDir);
  migrateDatabase(db);
  seedDemoData(db);
  db.raw.close();
}
