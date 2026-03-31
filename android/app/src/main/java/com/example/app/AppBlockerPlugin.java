package com.example.app;

import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.view.accessibility.AccessibilityManager;
import android.util.Base64;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppBlocker")
public class AppBlockerPlugin extends Plugin {

    private SharedPreferences getPrefs() {
        return getContext().getSharedPreferences("StudyHubBlocker", Context.MODE_PRIVATE);
    }

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        JSArray apps = new JSArray();

        for (ApplicationInfo appInfo : packages) {
            // Filter out system apps mostly
            if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0) {
                // Ignore deep system apps, but maybe keep some. Actually for a focus app, they might want to block YouTube (System app).
                if (!appInfo.packageName.contains("youtube") && !appInfo.packageName.contains("chrome")) {
                    continue; 
                }
            }

            // Exclude our own app
            if (appInfo.packageName.equals(getContext().getPackageName())) {
                continue;
            }

            JSObject appObj = new JSObject();
            appObj.put("packageName", appInfo.packageName);
            appObj.put("name", pm.getApplicationLabel(appInfo).toString());
            
            // Try to add icon as base64
            try {
                Drawable icon = pm.getApplicationIcon(appInfo);
                Bitmap bitmap = Bitmap.createBitmap(icon.getIntrinsicWidth() <= 0 ? 100 : icon.getIntrinsicWidth(),
                        icon.getIntrinsicHeight() <= 0 ? 100 : icon.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
                Canvas canvas = new Canvas(bitmap);
                icon.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                icon.draw(canvas);
                
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                try {
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);
                    byte[] b = baos.toByteArray();
                    String encodedIcon = Base64.encodeToString(b, Base64.DEFAULT);
                    appObj.put("icon", "data:image/png;base64," + encodedIcon);
                } finally {
                    bitmap.recycle();
                    baos.close();
                }
            } catch (Exception e) {
                // Ignore icon failures
                appObj.put("icon", "");
            }

            apps.put(appObj);
        }

        JSObject ret = new JSObject();
        ret.put("apps", apps);
        call.resolve(ret);
    }

    @PluginMethod
    public void setBlockedApps(PluginCall call) {
        JSArray arr = call.getArray("packages", new JSArray());
        Set<String> blockedSet = new HashSet<>();
        try {
            for (int i=0; i < arr.length(); i++) {
                blockedSet.add(arr.getString(i));
            }
        } catch (Exception e) {
            android.util.Log.e("AppBlockerPlugin", "Error reading blocked packages", e);
            call.reject("Failed to read blocked packages", e);
            return;
        }

        getPrefs().edit().putStringSet("blockedApps", blockedSet).apply();
        call.resolve();
    }

    @PluginMethod
    public void setBlockingActive(PluginCall call) {
        boolean active = call.getBoolean("active", false);
        getPrefs().edit().putBoolean("isBlockingActive", active).apply();
        call.resolve();
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("hasOverlay", hasOverlayPermission());
        ret.put("hasAccessibility", hasAccessibilityPermission());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestOverlayPermission(PluginCall call) {
        if (!hasOverlayPermission()) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void requestAccessibilityPermission(PluginCall call) {
        if (!hasAccessibilityPermission()) {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    private boolean hasOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(getContext());
        }
        return true; // Lower than M has it by default
    }

    private boolean hasAccessibilityPermission() {
        int accessibilityEnabled = 0;
        final String service = getContext().getPackageName() + "/" + AppBlockerService.class.getCanonicalName();
        try {
            accessibilityEnabled = Settings.Secure.getInt(
                    getContext().getApplicationContext().getContentResolver(),
                    android.provider.Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (Settings.SettingNotFoundException e) {}

        if (accessibilityEnabled == 1) {
            String settingValue = Settings.Secure.getString(
                    getContext().getApplicationContext().getContentResolver(),
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (settingValue != null) {
                for (String s : settingValue.split(":")) {
                    if (s.equals(service)) return true;
                }
            }
        }
        return false;
    }
}
