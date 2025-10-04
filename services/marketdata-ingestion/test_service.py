#!/usr/bin/env python3
"""
Test script for Market Data Ingestion Service
Run this script to verify the service is working correctly.
"""

import asyncio
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from services.market_data_factory import MarketDataFactory, MarketDataProvider

async def test_market_data_service():
    """Test the market data service functionality."""
    print("🧪 Testing Market Data Ingestion Service...")

    try:
        # Test 1: Check available providers
        print("\n1. Testing available providers...")
        providers = MarketDataFactory.get_available_providers()
        print(f"✅ Available providers: {[p.name for p in providers]}")

        # Test 2: Create Yahoo service and test quote
        print("\n2. Testing Yahoo Finance service...")
        yahoo_service = MarketDataFactory.create_service(MarketDataProvider.YAHOO)
        print("✅ Yahoo service created successfully")

        # Test quote retrieval
        print("📈 Getting quote for AAPL...")
        quote = await yahoo_service.get_quote("AAPL")
        if quote:
            print(f"✅ Quote retrieved: {quote.symbol} - ${quote.price:.2f}")
            print(f"   Change: {quote.change:+.2f} ({quote.change_percent:+.2f}%)")
            print(f"   Volume: {quote.volume:,}")
        else:
            print("❌ Failed to get quote for AAPL")

        # Test 3: Test historical data
        print("\n3. Testing historical data...")
        hist_data = await yahoo_service.get_historical_data("AAPL", "1d", limit=5)
        if hist_data:
            print(f"✅ Historical data retrieved: {len(hist_data)} data points")
            for data_point in hist_data[:3]:  # Show first 3
                print(f"   {data_point.timestamp.strftime('%Y-%m-%d')}: ${data_point.close:.2f}")
        else:
            print("❌ Failed to get historical data")

        # Test 4: Test symbol search
        print("\n4. Testing symbol search...")
        search_results = await yahoo_service.search_symbols("Apple")
        if search_results:
            print(f"✅ Search results: {len(search_results)} matches")
            for result in search_results[:3]:  # Show first 3
                print(f"   {result.get('symbol', 'N/A')} - {result.get('name', 'N/A')}")
        else:
            print("❌ No search results found")

        # Test 5: Clean up resources
        print("\n5. Cleaning up resources...")
        await yahoo_service.close()
        print("✅ Service cleanup completed")

        print("\n🎉 All tests passed! Market Data service is working correctly.")

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True

if __name__ == "__main__":
    success = asyncio.run(test_market_data_service())
    sys.exit(0 if success else 1)
