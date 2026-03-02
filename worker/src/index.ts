interface Env {
  DEV_CTX_STORE: KVNamespace;
  API_KEY: string;
}

interface ContextMeta {
  id: string;
  label: string;
  createdAt: string;
  branch: string | null;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function error(message: string, status: number): Response {
  return json({ error: message }, status);
}

function authenticate(request: Request, env: Env): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === env.API_KEY;
}

async function getIndex(env: Env): Promise<ContextMeta[]> {
  const raw = await env.DEV_CTX_STORE.get('index');
  if (!raw) return [];
  return JSON.parse(raw) as ContextMeta[];
}

async function setIndex(env: Env, index: ContextMeta[]): Promise<void> {
  await env.DEV_CTX_STORE.put('index', JSON.stringify(index));
}

// GET /api/contexts — 전체 목록 (메타데이터만)
async function handleList(env: Env): Promise<Response> {
  const index = await getIndex(env);
  return json({ contexts: index });
}

// GET /api/contexts/:id — 특정 컨텍스트 조회
async function handleGet(env: Env, id: string): Promise<Response> {
  const raw = await env.DEV_CTX_STORE.get(`ctx:${id}`);
  if (!raw) return error('Context not found', 404);
  return json(JSON.parse(raw));
}

// PUT /api/contexts/:id — 컨텍스트 저장/업데이트
async function handlePut(request: Request, env: Env, id: string): Promise<Response> {
  const body = await request.json() as Record<string, unknown>;

  if (!body || typeof body !== 'object') {
    return error('Invalid request body', 400);
  }

  // KV에 저장 (90일 TTL)
  await env.DEV_CTX_STORE.put(`ctx:${id}`, JSON.stringify(body), {
    expirationTtl: 90 * 24 * 60 * 60,
  });

  // 인덱스 업데이트
  const index = await getIndex(env);
  const meta: ContextMeta = {
    id,
    label: (body.label as string) ?? '',
    createdAt: (body.createdAt as string) ?? new Date().toISOString(),
    branch: (body.git as Record<string, unknown>)?.branch as string | null ?? null,
  };

  const existing = index.findIndex((m) => m.id === id);
  if (existing >= 0) {
    index[existing] = meta;
  } else {
    index.unshift(meta);
  }

  await setIndex(env, index);
  return json({ ok: true, id });
}

// DELETE /api/contexts/:id — 컨텍스트 삭제
async function handleDelete(env: Env, id: string): Promise<Response> {
  await env.DEV_CTX_STORE.delete(`ctx:${id}`);

  const index = await getIndex(env);
  const filtered = index.filter((m) => m.id !== id);
  await setIndex(env, filtered);

  return json({ ok: true, id });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 인증 검증
    if (!authenticate(request, env)) {
      return error('Unauthorized', 401);
    }

    // 라우팅
    const contextMatch = path.match(/^\/api\/contexts\/(.+)$/);

    if (path === '/api/contexts' && request.method === 'GET') {
      return handleList(env);
    }

    if (contextMatch) {
      const id = contextMatch[1];
      switch (request.method) {
        case 'GET':
          return handleGet(env, id);
        case 'PUT':
          return handlePut(request, env, id);
        case 'DELETE':
          return handleDelete(env, id);
        default:
          return error('Method not allowed', 405);
      }
    }

    return error('Not found', 404);
  },
} satisfies ExportedHandler<Env>;
