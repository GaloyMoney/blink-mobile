package com.galoyapp

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import androidx.work.Data
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager

class BitcoinPriceWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        val data = Data.Builder()
            .putString("RANGE", "ONE_DAY") // Default range; this can be changed dynamically
            .build()

        val periodicWorkRequest = PeriodicWorkRequestBuilder<FetchPriceWorker>(2, TimeUnit.MINUTES)
            .setInputData(data)
            .build()

        WorkManager.getInstance(context).enqueue(periodicWorkRequest)
    }

    override fun onDisabled(context: Context) {
        WorkManager.getInstance(context).cancelAllWorkByTag("FETCH_PRICE_WORK")
    }
}

internal fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
    val prefs = context.getSharedPreferences("bitcoinPricePrefs", Context.MODE_PRIVATE)
    val priceInfo = prefs.getString("PRICE_INFO", "Waiting for price...")

    val views = RemoteViews(context.packageName, R.layout.bitcoin_price_widget)
    views.setTextViewText(R.id.appwidget_text, priceInfo)
    appWidgetManager.updateAppWidget(appWidgetId, views)
}

class FetchPriceWorker(context: Context, params: WorkerParameters) : Worker(context, params) {

    override fun doWork(): Result {
        val range = inputData.getString("RANGE") ?: "FIVE_YEARS"
        val jsonResponse = fetchBitcoinPrice(range)
        val prefs = applicationContext.getSharedPreferences("bitcoinPricePrefs", Context.MODE_PRIVATE)
        with(prefs.edit()) {
            putString("PRICE_INFO", jsonResponse)
            apply()
        }

        return Result.success()
    }

    private fun fetchBitcoinPrice(range: String): String {
        val url = URL("https://api.mainnet.galoy.io/graphql")
        val jsonInputString = "{\"query\":\"query btcPriceList(\$range: PriceGraphRange!) { btcPriceList(range: \$range) { timestamp price { base offset currencyUnit } } }\",\"variables\":{\"range\":\"$range\"}}"

        with(url.openConnection() as HttpURLConnection) {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json")
            doOutput = true
            outputStream.use { os ->
                os.write(jsonInputString.toByteArray())
            }

            return if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader(InputStreamReader(inputStream)).use { br ->
                    br.readText()
                }
            } else {
                "Failed to fetch price"
            }
        }
    }
}