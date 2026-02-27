# Elite – Resell Price Alert System

Get notified the moment a price **drops** (time to buy) or **rises** (time to sell).

## Features

- **BUY alerts** – trigger when the price falls to or below your target price
- **SELL alerts** – trigger when the price rises to or above your target price
- Multiple alerts per item supported
- Custom notification callback (defaults to console output)
- Simple interactive CLI

## Quick Start

```bash
python main.py
```

### CLI Commands

| Command | Description |
|---|---|
| `add <item> buy <price>` | Alert when item price drops to `<price>` |
| `add <item> sell <price>` | Alert when item price rises to `<price>` |
| `price <item> <new_price>` | Update current price and check alerts |
| `list` | Show all active alerts |
| `remove <item> buy\|sell` | Remove an active alert |
| `help` | Show usage |
| `quit` | Exit |

### Example Session

```
> add Nike-Dunks buy 90.00
[BUY] Nike-Dunks | target: $90.00 | current: $0.00 | active

> add Nike-Dunks sell 150.00
[SELL] Nike-Dunks | target: $150.00 | current: $0.00 | active

> price Nike-Dunks 85.00
[PRICE ALERT] BUY  🟢 | Nike-Dunks hit $85.00 (target: $90.00)

> price Nike-Dunks 160.00
[PRICE ALERT] SELL 🔴 | Nike-Dunks hit $160.00 (target: $150.00)
```

## Programmatic Usage

```python
from price_alert import AlertManager, AlertType

mgr = AlertManager()

# Notify when price drops to $90 (good time to buy)
mgr.add_alert("Nike-Dunks", AlertType.BUY, target_price=90.00, current_price=110.00)

# Notify when price rises to $150 (good time to sell)
mgr.add_alert("Nike-Dunks", AlertType.SELL, target_price=150.00, current_price=110.00)

# Simulate a price drop – triggers the BUY alert
mgr.update_price("Nike-Dunks", 85.00)

# Simulate a price rise – triggers the SELL alert
mgr.update_price("Nike-Dunks", 155.00)
```

## Running Tests

```bash
python -m pytest tests/ -v
```
