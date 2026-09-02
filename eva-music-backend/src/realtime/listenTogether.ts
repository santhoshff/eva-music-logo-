import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';

interface SessionClient {
  ws: WebSocket;
  userId: string;
}

const activeSessions = new Map<string, SessionClient[]>();

export function setupListenTogetherRealtime(fastify: FastifyInstance) {
  fastify.get('/api/realtime/listen-together', { websocket: true }, (connection: any, req) => {
    const socket: WebSocket = connection.socket || connection;
    let currentSessionId: string | null = null;
    let userId = (req.query as any)?.userId || 'guest';

    socket.on('message', (message: string) => {
      try {
        const payload = JSON.parse(message.toString());
        const { type, sessionId, trackId, positionMs, isPlaying } = payload;

        if (type === 'join') {
          currentSessionId = sessionId;
          if (!activeSessions.has(sessionId)) {
            activeSessions.set(sessionId, []);
          }
          activeSessions.get(sessionId)!.push({ ws: socket, userId });
          socket.send(JSON.stringify({ type: 'joined', sessionId }));
          return;
        }

        if (type === 'sync' && currentSessionId) {
          const clients = activeSessions.get(currentSessionId) || [];
          for (const client of clients) {
            if (client.ws !== socket && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(
                JSON.stringify({
                  type: 'state_update',
                  trackId,
                  positionMs,
                  isPlaying,
                  senderId: userId,
                })
              );
            }
          }
        }
      } catch (err: any) {
        console.warn('[Realtime] Message handling error:', err?.message || err);
      }
    });

    socket.on('close', () => {
      if (currentSessionId && activeSessions.has(currentSessionId)) {
        const clients = activeSessions.get(currentSessionId)!;
        activeSessions.set(
          currentSessionId,
          clients.filter(c => c.ws !== socket)
        );
      }
    });
  });
}
