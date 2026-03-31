package com.example.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.widget.Button;
import android.widget.TextView;
import android.widget.LinearLayout;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class AppBlockerService extends AccessibilityService {

    private WindowManager windowManager;
    private View overlayView;
    private boolean isOverlayShowing = false;
    private SharedPreferences prefs;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        prefs = getSharedPreferences("StudyHubBlocker", MODE_PRIVATE);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            if (event.getPackageName() != null) {
                String packageName = event.getPackageName().toString();
                checkAndBlockApp(packageName);
            }
        }
    }

    private void checkAndBlockApp(String packageName) {
        // Is blocking currently active?
        boolean isBlockingActive = prefs.getBoolean("isBlockingActive", false);
        if (!isBlockingActive) {
            removeOverlay();
            return;
        }

        // Is this app on the blocklist?
        Set<String> blockedApps = prefs.getStringSet("blockedApps", new HashSet<>());
        
        // Don't block ourselves
        if (packageName.equals(getPackageName())) {
            removeOverlay();
            return;
        }

        if (blockedApps.contains(packageName)) {
            showOverlay();
        } else {
            // Not a blocked app, ensure overlay is removed
            // but be careful not to remove it if they are just seeing the System UI
            if (!packageName.equals("com.android.systemui")) {
                removeOverlay();
            }
        }
    }

    private void showOverlay() {
        if (isOverlayShowing) return;

        // Check if we have overlay permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            return;
        }

        if (overlayView == null) {
            LinearLayout layout = new LinearLayout(this);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setBackgroundColor(Color.parseColor("#060e20")); // study hub deep theme
            layout.setGravity(Gravity.CENTER);

            TextView title = new TextView(this);
            title.setText("Focus Mode Active");
            title.setTextColor(Color.WHITE);
            title.setTextSize(32);
            title.setGravity(Gravity.CENTER);
            title.setPadding(0, 0, 0, 50);
            
            TextView subtitle = new TextView(this);
            subtitle.setText("This app is blocked so you can stay focused.");
            subtitle.setTextColor(Color.parseColor("#A0AAB2"));
            subtitle.setTextSize(18);
            subtitle.setGravity(Gravity.CENTER);
            subtitle.setPadding(0, 0, 0, 100);

            Button backBtn = new Button(this);
            backBtn.setText("Return to Study Hub");
            backBtn.setBackgroundColor(Color.parseColor("#10B981")); // Emerald Primary
            backBtn.setTextColor(Color.WHITE);
            backBtn.setPadding(40, 30, 40, 30);
            backBtn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = getPackageManager().getLaunchIntentForPackage(getPackageName());
                    if (intent != null) {
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    }
                    removeOverlay();
                }
            });

            layout.addView(title);
            layout.addView(subtitle);
            layout.addView(backBtn);
            
            overlayView = layout;
        }

        int layoutFlag;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
        }

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN |
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                PixelFormat.TRANSLUCENT);

        try {
            windowManager.addView(overlayView, params);
            isOverlayShowing = true;
        } catch (IllegalStateException e) {
            android.util.Log.e("AppBlockerService", "Overlay already added", e);
        } catch (WindowManager.BadTokenException e) {
            android.util.Log.e("AppBlockerService", "Bad window token", e);
        } catch (Exception e) {
            android.util.Log.e("AppBlockerService", "Error adding overlay", e);
        }
    }

    private void removeOverlay() {
        if (isOverlayShowing && overlayView != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (IllegalArgumentException e) {
                android.util.Log.e("AppBlockerService", "View not attached", e);
            } catch (Exception e) {
                android.util.Log.e("AppBlockerService", "Error removing overlay", e);
            } finally {
                isOverlayShowing = false;
            }
        }
    }

    @Override
    public void onInterrupt() {
        removeOverlay();
    }

    @Override
    public void onDestroy() {
        removeOverlay();
        super.onDestroy();
    }
}
