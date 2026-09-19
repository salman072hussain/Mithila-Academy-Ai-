package com.mithila.academy.widget

import android.content.Context
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.color.ColorProvider
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.mithila.academy.MainActivity

/**
 * Modern Jetpack Glance App Widget for Mithila Academy AI.
 * Declarative Jetpack Compose layout for Android Home-Screen.
 */
class MithilaGlanceWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            GlanceTheme {
                Column(
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .wrapContentHeight()
                        .padding(12.dp)
                        .background(androidx.compose.ui.graphics.Color(0xFF0F172A))
                        .cornerRadius(20.dp)
                ) {
                    // Header Brand
                    Row(
                        modifier = GlanceModifier.fillMaxWidth().padding(bottom = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Mithila Academy AI",
                            style = TextStyle(
                                color = ColorProvider(androidx.compose.ui.graphics.Color(0xFFF8FAFC)),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Spacer(modifier = GlanceModifier.defaultWeight())
                        Text(
                            text = "Surendra Sir",
                            style = TextStyle(
                                color = ColorProvider(androidx.compose.ui.graphics.Color(0xFFF59E0B)),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    // Google-Style Search Bar Pill
                    Row(
                        modifier = GlanceModifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .background(androidx.compose.ui.graphics.Color(0xFF1E293B))
                            .cornerRadius(24.dp)
                            .padding(horizontal = 12.dp)
                            .clickable(actionStartActivity<MainActivity>()),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Ask Mithila Academy AI...",
                            modifier = GlanceModifier.defaultWeight(),
                            style = TextStyle(
                                color = ColorProvider(androidx.compose.ui.graphics.Color(0xFF94A3B8)),
                                fontSize = 13.sp
                            )
                        )

                        // Action Shortcuts
                        Text(
                            text = "📷",
                            modifier = GlanceModifier.padding(horizontal = 6.dp)
                        )
                        Text(
                            text = "🎙️",
                            modifier = GlanceModifier.padding(horizontal = 6.dp)
                        )
                    }
                }
            }
        }
    }
}

class MithilaGlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = MithilaGlanceWidget()
}
