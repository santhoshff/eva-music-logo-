/**
 * EVA Music - Listen Together Real-Time Client
 * Connects to Fastify WebSocket for synchronized shared listening.
 */

export interface ListenTogetherState {
  isConnected: boolean;
  roomId: string | null;
  isHost: boolean;
  memberCount: number;
  lastSyncedTrackId: string | null;
  lastSyncedPosition: number | null;
  lastSyncedPlaying: boolean | null;
}

type StateListener = (state: ListenTogetherState) => void;
type SyncCallback = (data: { trackId: string; positionMs: number; isPlaying: boolean }) => void;

class ListenTogetherService {
  private ws: WebSocket | null = null;
  private state: ListenTogetherState = {
    isConnected: false,
    roomId: null,
    isHost: false,
    memberCount: 1,
    lastSyncedTrackId: null,
    lastSyncedPosition: null,
    lastSyncedPlaying: null,
  };

  private stateListeners: Set<StateListener> = new Set();
  private syncCallbacks: Set<SyncCallback> = new Set();
  private userId: string = 'user_' + Math.random().toString(36).substring(2, 8);

  public getState(): ListenTogetherState {
    return { ...this.state };
  }

  public subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onRemoteSync(cb: SyncCallback): () => void {
    this.syncCallbacks.add(cb);
    return () => this.syncCallbacks.delete(cb);
  }

  private notify(): void {
    const s = this.getState();
    this.stateListeners.forEach(fn => fn(s));
  }

  public connect(roomId: string, isHost = false): void {
    this.disconnect();

    const host = window.location.hostname || 'localhost';
    const wsUrl = `ws://${host}:8080/api/realtime/listen-together?userId=${this.userId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.state = {
          ...this.state,
          isConnected: true,
          roomId,
          isHost,
        };
        this.notify();

        // Send join packet
        this.ws?.send(
          JSON.stringify({
            type: 'join',
            sessionId: roomId,
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'joined') {
            this.state.roomId = data.sessionId;
            this.notify();
          } else if (data.type === 'state_update') {
            this.state.lastSyncedTrackId = data.trackId;
            this.state.lastSyncedPosition = data.positionMs;
            this.state.lastSyncedPlaying = data.isPlaying;
            this.notify();

            // Notify audio engine listeners
            this.syncCallbacks.forEach(cb =>
              cb({
                trackId: data.trackId,
                positionMs: data.positionMs,
                isPlaying: data.isPlaying,
              })
            );
          }
        } catch (err) {
          console.warn('[ListenTogether] Message parse error:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[ListenTogether] WebSocket error:', err);
      };

      this.ws.onclose = () => {
        this.state = {
          ...this.state,
          isConnected: false,
          roomId: null,
          isHost: false,
        };
        this.notify();
      };
    } catch (e) {
      console.error('[ListenTogether] Connection failed:', e);
    }
  }

  public broadcastPlayback(trackId: string, positionSecs: number, isPlaying: boolean): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.state.roomId) return;

    this.ws.send(
      JSON.stringify({
        type: 'sync',
        sessionId: this.state.roomId,
        trackId,
        positionMs: Math.round(positionSecs * 1000),
        isPlaying,
      })
    );
  }

  public disconnect(): void {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.state = {
      isConnected: false,
      roomId: null,
      isHost: false,
      memberCount: 1,
      lastSyncedTrackId: null,
      lastSyncedPosition: null,
      lastSyncedPlaying: null,
    };
    this.notify();
  }
}

export const listenTogetherService = new ListenTogetherService();
