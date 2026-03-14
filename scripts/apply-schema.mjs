import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Supabase connection pooler (Transaction mode)
// Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const PROJECT_REF = 'hgurcoennrynynaucmdy';

// Get the DB password from command line arg or prompt
const DB_PASSWORD = process.argv[2];
if (!DB_PASSWORD) {
  console.error('Usage: node scripts/apply-schema.mjs <database-password>');
  console.error('Find your database password in Supabase Dashboard → Settings → Database');
  process.exit(1);
}

const connectionString = `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
});

async function run() {
  try {
    // Test connection
    const [{ now }] = await sql`SELECT now()`;
    console.log('Connected to database at:', now);

    // Read and execute schema
    const schemaPath = resolve(__dirname, '../supabase/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute statement by statement
    const statements = schema
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.split('\n')[0].slice(0, 80);
      try {
        await sql.unsafe(stmt);
        console.log(`  ✓ [${i + 1}/${statements.length}] ${preview}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('already exists')) {
          console.log(`  ⊘ [${i + 1}/${statements.length}] Already exists — ${preview}`);
        } else {
          console.error(`  ✗ [${i + 1}/${statements.length}] ${preview}`);
          console.error(`    Error: ${msg}`);
        }
      }
    }

    console.log('\n✓ Schema applied successfully');
  } catch (err) {
    console.error('Connection error:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
