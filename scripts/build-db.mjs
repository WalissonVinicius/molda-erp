// Monta o banco local de desenvolvimento (db/molda.db) a partir de schema.sql + seed.sql.
// Uso: npm run db:build
import { createClient } from '@libsql/client'
import { readFileSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(base)

const DB_FILE = 'db/molda.db'
if (existsSync(DB_FILE)) rmSync(DB_FILE)

const db = createClient({ url: 'file:' + DB_FILE })
await db.executeMultiple(readFileSync('db/schema.sql', 'utf8'))
await db.execute('PRAGMA foreign_keys = ON')
await db.execute('PRAGMA recursive_triggers = ON')
await db.executeMultiple(readFileSync('db/seed.sql', 'utf8'))

const r = await db.execute(
  'SELECT (SELECT COUNT(*) FROM clientes) AS clientes,' +
  ' (SELECT COUNT(*) FROM contratos) AS contratos,' +
  ' (SELECT COUNT(*) FROM faturas) AS faturas'
)
console.log('Banco local criado em', DB_FILE)
console.log(Object.fromEntries(r.columns.map((c, i) => [c, r.rows[0][i]])))
process.exit(0)
