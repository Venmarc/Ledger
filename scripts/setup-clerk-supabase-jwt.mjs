/**
 * Configure Clerk JWT template "supabase" with Supabase's HS256 JWT secret.
 *
 * Pause/resume does NOT wipe schema. This fixes the auth bridge when the
 * template is missing or signed with Clerk's default key (Supabase rejects it).
 *
 * Usage:
 *   SUPABASE_JWT_SECRET="your-legacy-jwt-secret" \
 *     node scripts/setup-clerk-supabase-jwt.mjs
 *
 * Get the secret from:
 *   Supabase Dashboard → Project Settings → API → JWT Settings → JWT Secret
 *   (sometimes labeled "Legacy JWT secret")
 *
 * Requires CLERK_SECRET_KEY in env or .env.local
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i)
    const v = t.slice(i + 1)
    if (!process.env[k]) process.env[k] = v
  }
}

loadEnvLocal()

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY
const SUPABASE_JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET

if (!CLERK_SECRET_KEY) {
  console.error('Missing CLERK_SECRET_KEY')
  process.exit(1)
}
if (!SUPABASE_JWT_SECRET) {
  console.error(
    'Missing SUPABASE_JWT_SECRET.\n' +
      'Copy from Supabase → Project Settings → API → JWT Secret, then:\n' +
      '  SUPABASE_JWT_SECRET="..." node scripts/setup-clerk-supabase-jwt.mjs'
  )
  process.exit(1)
}

const claims = {
  aud: 'authenticated',
  role: 'authenticated',
  email: '{{user.primary_email_address}}',
  // Clerk user id is already in `sub` by default for session tokens
}

const headers = {
  Authorization: `Bearer ${CLERK_SECRET_KEY}`,
  'Content-Type': 'application/json',
}

async function listTemplates() {
  const res = await fetch('https://api.clerk.com/v1/jwt_templates', { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return Array.isArray(data) ? data : data.data || []
}

async function main() {
  const templates = await listTemplates()
  const existing = templates.find((t) => t.name === 'supabase')

  const body = {
    name: 'supabase',
    claims,
    lifetime: 60 * 60, // 1 hour
    allowed_clock_skew: 5,
    custom_signing_key: true,
    signing_algorithm: 'HS256',
    signing_key: SUPABASE_JWT_SECRET,
  }

  let res
  if (existing) {
    console.log('Updating existing template', existing.id)
    res = await fetch(`https://api.clerk.com/v1/jwt_templates/${existing.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    })
  } else {
    console.log('Creating JWT template "supabase"')
    res = await fetch('https://api.clerk.com/v1/jwt_templates', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  }

  const data = await res.json()
  if (!res.ok) {
    console.error('Clerk API error:', data)
    process.exit(1)
  }

  console.log('OK — template ready:')
  console.log({
    id: data.id,
    name: data.name,
    signing_algorithm: data.signing_algorithm,
    custom_signing_key: data.custom_signing_key,
    lifetime: data.lifetime,
    claims: data.claims,
  })
  console.log(
    '\nNext: hard-refresh the app (or sign out/in), then open /transactions.'
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
