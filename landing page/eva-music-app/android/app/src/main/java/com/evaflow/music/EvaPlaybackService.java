package com.evaflow.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ServiceInfo;
import android.graphics.drawable.Icon;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;

public class EvaPlaybackService extends Service {
    public static final String CHANNEL_ID = "eva_music_playback";
    public static final int NOTIFICATION_ID = 4711;
    static final String A_PLAY = "com.evaflow.music.PLAY";
    static final String A_PAUSE = "com.evaflow.music.PAUSE";
    static final String A_NEXT = "com.evaflow.music.NEXT";
    static final String A_PREV = "com.evaflow.music.PREV";

    static EvaMediaPlugin plugin;

    private MediaSession session;
    private BroadcastReceiver receiver;

    static void emit(String action) {
        if (plugin != null) plugin.emitAction(action);
    }

    public static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = ctx.getSystemService(NotificationManager.class);
            if (nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "Music playback", NotificationManager.IMPORTANCE_LOW);
                ch.setDescription("Shows what EVA Music is playing with play, pause and skip controls");
                ch.setShowBadge(false);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
            }
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannel(this);
        session = new MediaSession(this, "EvaMusic");
        session.setCallback(new MediaSession.Callback() {
            @Override public void onPlay() { emit("play"); }
            @Override public void onPause() { emit("pause"); }
            @Override public void onSkipToNext() { emit("next"); }
            @Override public void onSkipToPrevious() { emit("previous"); }
            @Override public void onStop() { emit("pause"); }
        });
        session.setActive(true);

        receiver = new BroadcastReceiver() {
            @Override public void onReceive(Context c, Intent i) {
                String a = i.getAction();
                if (A_PLAY.equals(a)) emit("play");
                else if (A_PAUSE.equals(a)) emit("pause");
                else if (A_NEXT.equals(a)) emit("next");
                else if (A_PREV.equals(a)) emit("previous");
            }
        };
        IntentFilter f = new IntentFilter();
        f.addAction(A_PLAY); f.addAction(A_PAUSE); f.addAction(A_NEXT); f.addAction(A_PREV);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(receiver, f, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(receiver, f);
    }

    private PendingIntent actionIntent(String action, int code) {
        Intent i = new Intent(action).setPackage(getPackageName());
        return PendingIntent.getBroadcast(this, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private Notification.Action act(int icon, String title, String action, int code) {
        return new Notification.Action.Builder(Icon.createWithResource(this, icon), title, actionIntent(action, code)).build();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String title = intent != null ? intent.getStringExtra("title") : null;
        String artist = intent != null ? intent.getStringExtra("artist") : null;
        boolean playing = intent != null && intent.getBooleanExtra("isPlaying", false);
        if (title == null) title = "EVA Music";
        if (artist == null) artist = "";

        session.setMetadata(new MediaMetadata.Builder()
                .putString(MediaMetadata.METADATA_KEY_TITLE, title)
                .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
                .build());
        session.setPlaybackState(new PlaybackState.Builder()
                .setActions(PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_PLAY_PAUSE
                        | PlaybackState.ACTION_SKIP_TO_NEXT | PlaybackState.ACTION_SKIP_TO_PREVIOUS)
                .setState(playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED,
                        PlaybackState.PLAYBACK_POSITION_UNKNOWN, 1f)
                .build());

        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent content = PendingIntent.getActivity(this, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, CHANNEL_ID) : new Notification.Builder(this);
        b.setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle(title)
                .setContentText(artist)
                .setContentIntent(content)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setShowWhen(false)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .addAction(act(android.R.drawable.ic_media_previous, "Previous", A_PREV, 1))
                .addAction(playing
                        ? act(android.R.drawable.ic_media_pause, "Pause", A_PAUSE, 2)
                        : act(android.R.drawable.ic_media_play, "Play", A_PLAY, 3))
                .addAction(act(android.R.drawable.ic_media_next, "Next", A_NEXT, 4))
                .setStyle(new Notification.MediaStyle()
                        .setMediaSession(session.getSessionToken())
                        .setShowActionsInCompactView(0, 1, 2));

        Notification n = b.build();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, n);
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        try { unregisterReceiver(receiver); } catch (Exception ignored) {}
        if (session != null) session.release();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
