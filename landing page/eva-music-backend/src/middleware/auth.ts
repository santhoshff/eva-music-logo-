import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../db/supabaseClient.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Return mock dev user for unauthenticated testing if auth token not provided
    request.user = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'samantha@evamusic.app',
    };
    return;
  }

  const token = authHeader.substring(7);
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      // Fallback dev user if token expired or mock
      request.user = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'samantha@evamusic.app',
      };
      return;
    }
    request.user = {
      id: data.user.id,
      email: data.user.email,
    };
  } catch (err) {
    request.user = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'samantha@evamusic.app',
    };
  }
}
