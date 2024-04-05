//
//  AppIntent.swift
//  BitcoinPriceWidget
//
//  Created by Sandipan Dey on 05/04/24.
//  Copyright © 2024 Galoy Inc. All rights reserved.
//

import WidgetKit
import AppIntents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Configuration"
    static var description = IntentDescription("This is an example widget.")

    // An example configurable parameter.
    @Parameter(title: "Favorite Emoji", default: "😃")
    var favoriteEmoji: String
}
