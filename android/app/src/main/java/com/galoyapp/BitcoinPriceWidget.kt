package com.galoyapp

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import androidx.work.Data
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import org.json.JSONArray
import org.json.JSONObject

class BitcoinPriceWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        val data = Data.Builder()
            .putString("RANGE", "ONE_DAY")
            .build()

        val periodicWorkRequest = PeriodicWorkRequestBuilder<FetchPriceWorker>(5, TimeUnit.MINUTES)
            .setInputData(data)
            .build()

        WorkManager.getInstance(context).enqueue(periodicWorkRequest)
    }

    override fun onDisabled(context: Context) {
        WorkManager.getInstance(context).cancelAllWorkByTag("FETCH_PRICE_WORK")
    }
}

private fun generateChartBitmap(context: Context, data: JSONArray): Bitmap {
    val chart = LineChart(context)
    chart.layout(0, 0, 1000, 1000)  // Set chart dimensions
    chart.setDrawGridBackground(false)

    val entries = ArrayList<Entry>()
    for (i in 0 until data.length()) {
        val item = data.getJSONObject(i)
        val price = item.getJSONObject("price").getString("formattedAmount").toFloat()
        entries.add(Entry(i.toFloat(), price))
    }

    val dataSet = LineDataSet(entries, "Bitcoin Price")
    val lineData = LineData(dataSet)
    chart.data = lineData

    chart.measure(
        View.MeasureSpec.makeMeasureSpec(300,View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(500,View.MeasureSpec.EXACTLY));
    chart.layout(0, 0, chart.measuredWidth, chart.measuredHeight);

    chart.invalidate()  // Refresh chart
    return chart.getChartBitmap();
}

internal fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
    val prefs = context.getSharedPreferences("bitcoinPricePrefs", Context.MODE_PRIVATE)
    val priceInfo = prefs.getString("PRICE_INFO", "[]")
    val array = JSONArray(priceInfo)

    val views = RemoteViews(context.packageName, R.layout.bitcoin_price_widget)
    val bitmap = generateChartBitmap(context, array)
    views.setImageViewBitmap(R.id.chart_image_view, bitmap)
    appWidgetManager.updateAppWidget(appWidgetId, views)
}

enum class BitcoinPriceRanges {
    ONE_DAY,
    ONE_WEEK,
    ONE_MONTH,
    ONE_YEAR,
    FIVE_YEARS,
}

class FetchPriceWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        val range = BitcoinPriceRanges.valueOf(inputData.getString("RANGE") ?: "ONE_DAY")
        val jsonResponse = fetchBitcoinPrice(range)
        val prefs =
            applicationContext.getSharedPreferences("bitcoinPricePrefs", Context.MODE_PRIVATE)
        with(prefs.edit()) {
            putString("PRICE_INFO", jsonResponse.toString())
            apply()
        }
        return Result.success()
    }

    private fun fetchBitcoinPrice(range: BitcoinPriceRanges): JSONArray {
        val url = URL("https://api.mainnet.galoy.io/graphql")
        val query = "query btcPriceList(\$range: PriceGraphRange!) { btcPriceList(range: \$range) { timestamp price { base offset currencyUnit formattedAmount } } }"
        val jsonInputString = """
        {
            "query": "$query",
            "variables": {
                "range": "$range"
            }
        }
        """.trimIndent()

        with(url.openConnection() as HttpURLConnection) {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json")
            doOutput = true
            outputStream.use { os ->
                os.write(jsonInputString.toByteArray())
            }

            return if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader(InputStreamReader(inputStream)).use { br ->
                    JSONObject(br.readText()).getJSONObject("data").getJSONArray("btcPriceList")
                }
            } else {
                JSONArray("[]")
            }
        }
    }
}