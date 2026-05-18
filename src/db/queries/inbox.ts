import { createId } from '../../utils/ids';
import type { ExternalInboxItem } from '../../integrations/types';
import type { LabLinkDatabase } from '../connection';

export function upsertExternalInboxItem(db: LabLinkDatabase, item: ExternalInboxItem): void {
  db.raw
    .prepare(
      `
      INSERT INTO inbox_items (id, source, source_id, subject, preview, from_label, body, received_at, unread, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      ON CONFLICT(source, source_id) DO UPDATE SET
        subject = excluded.subject,
        preview = excluded.preview,
        from_label = excluded.from_label,
        body = excluded.body,
        received_at = excluded.received_at,
        raw_json = excluded.raw_json
      `,
    )
    .run(
      createId(),
      item.source,
      item.sourceId,
      item.subject,
      item.preview ?? null,
      item.fromLabel ?? null,
      item.body ?? null,
      item.receivedAt,
      JSON.stringify(item.raw),
    );
}
