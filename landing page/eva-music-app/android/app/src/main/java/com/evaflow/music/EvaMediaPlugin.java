package com.evaflow.music;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "EvaMedia",
    permissions = { @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class EvaMediaPlugin extends Plugin {

    @Override
    public void load() {
        EvaPlaybackService.plugin = this;
        EvaPlaybackService.ensureChannel(getContext());
    }

    void emitAction(String action) {
        JSObject o = new JSObject();
        o.put("action", action);
        notifyListeners("mediaAction", o);
    }

    private boolean hasPermission() {
        return Build.VERSION.SDK_INT < 33 || getPermissionState("notifications") == PermissionState.GRANTED;
    }

    private JSObject status() {
        JSObject o = new JSObject();
        boolean enabled = NotificationManagerCompat.from(getContext()).areNotificationsEnabled();
        boolean channel = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getContext().getSystemService(NotificationManager.class);
            NotificationChannel ch = nm.getNotificationChannel(EvaPlaybackService.CHANNEL_ID);
            channel = ch == null || ch.getImportance() != NotificationManager.IMPORTANCE_NONE;
        }
        o.put("permission", hasPermission());
        o.put("enabled", enabled);
        o.put("channelEnabled", channel);
        return o;
    }

    @PluginMethod
    public void checkNotificationStatus(PluginCall call) { call.resolve(status()); }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (hasPermission()) { call.resolve(status()); return; }
        requestPermissionForAlias("notifications", call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) { call.resolve(status()); }

    private void startService(String title, String artist, boolean playing) {
        Intent i = new Intent(getContext(), EvaPlaybackService.class);
        i.putExtra("title", title);
        i.putExtra("artist", artist);
        i.putExtra("isPlaying", playing);
        ContextCompat.startForegroundService(getContext(), i);
    }

    @PluginMethod
    public void update(PluginCall call) {
        try {
            startService(call.getString("title", "EVA Music"), call.getString("artist", ""), call.getBoolean("isPlaying", false));
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not show playback notification: " + e.getMessage());
        }
    }

    @PluginMethod
    public void hide(PluginCall call) {
        getContext().stopService(new Intent(getContext(), EvaPlaybackService.class));
        call.resolve();
    }

    @PluginMethod
    public void runTest(PluginCall call) {
        JSObject s = status();
        if (!s.getBool("permission") || !s.getBool("enabled") || !s.getBool("channelEnabled")) {
            s.put("posted", false);
            call.resolve(s);
            return;
        }
        try {
            startService("EVA Music test", "Playback notification is working", true);
        } catch (Exception e) {
            s.put("posted", false);
            s.put("error", e.getMessage());
            call.resolve(s);
            return;
        }
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            boolean posted = false;
            NotificationManager nm = getContext().getSystemService(NotificationManager.class);
            for (StatusBarNotification n : nm.getActiveNotifications()) {
                if (n.getId() == EvaPlaybackService.NOTIFICATION_ID) { posted = true; break; }
            }
            JSObject r = status();
            r.put("posted", posted);
            call.resolve(r);
        }, 1200);
    }
}
