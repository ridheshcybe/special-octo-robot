const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const output = mkdtempSync(path.join(tmpdir(), 'topic-notes-'));
try {
  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc',
    'app/prepmeup/_lib/topicNotes.ts', 'app/prepmeup/_lib/data.ts',
    '--module', 'commonjs', '--target', 'ES2022', '--outDir', output, '--skipLibCheck']);
  const { resolveTopicNote: resolve } = require(path.join(output, 'topicNotes.js'));
  const topic = { id: 'topic-1', slug: 'operators', is_sample: false };
  const sample = { topic_id: 'topic-1', content: 'Existing sample' };
  assert.equal(resolve(topic, null, {}), null);
  assert.equal(resolve(topic, null, { operators: 'Existing note' }), 'Existing note');
  assert.equal(resolve(topic, null, { operators: '  ' }), null);
  assert.equal(resolve({ ...topic, is_sample: true }, sample, {}), 'Existing sample');
  assert.equal(resolve({ ...topic, is_sample: true }, { ...sample, topic_id: 'other' }, {}), null);
  assert.equal(resolve(topic, sample, {}), null);
  console.log('6 topic-note regression checks passed');
} finally { rmSync(output, { recursive: true, force: true }); }
