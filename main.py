#!/usr/bin/env python3
"""
Elite Resell Price Alert System – interactive CLI

Commands
--------
  add <item> buy  <target>   Set a BUY  alert (notify when price drops to target)
  add <item> sell <target>   Set a SELL alert (notify when price rises to target)
  price <item> <new_price>   Update current price and check alerts
  list                       List all active alerts
  remove <item> buy|sell     Remove an active alert
  help                       Show this help text
  quit / exit                Exit the program
"""

import sys
from price_alert import AlertManager, AlertType


def print_help() -> None:
    print(__doc__)


def run_cli(manager: AlertManager) -> None:
    print("Elite Resell Price Alert System  (type 'help' for commands)\n")
    while True:
        try:
            raw = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if not raw:
            continue

        parts = raw.split()
        cmd = parts[0].lower()

        if cmd in ("quit", "exit"):
            print("Exiting.")
            break

        elif cmd == "help":
            print_help()

        elif cmd == "add":
            # add <item> buy|sell <target>
            if len(parts) < 4:
                print("Usage: add <item> buy|sell <target_price>")
                continue
            item_name = parts[1]
            alert_type_str = parts[2].lower()
            try:
                target = float(parts[3])
            except ValueError:
                print("Error: target_price must be a number.")
                continue
            if alert_type_str == "buy":
                atype = AlertType.BUY
            elif alert_type_str == "sell":
                atype = AlertType.SELL
            else:
                print("Error: alert type must be 'buy' or 'sell'.")
                continue
            try:
                alert = manager.add_alert(item_name, atype, target)
                print(f"Alert added: {alert}")
            except ValueError as exc:
                print(f"Error: {exc}")

        elif cmd == "price":
            # price <item> <new_price>
            if len(parts) < 3:
                print("Usage: price <item> <new_price>")
                continue
            item_name = parts[1]
            try:
                new_price = float(parts[2])
            except ValueError:
                print("Error: new_price must be a number.")
                continue
            try:
                triggered = manager.update_price(item_name, new_price)
                if not triggered:
                    print(f"Price updated for '{item_name}': ${new_price:.2f}  (no alerts triggered)")
            except ValueError as exc:
                print(f"Error: {exc}")

        elif cmd == "list":
            active = manager.get_active_alerts()
            if not active:
                print("No active alerts.")
            else:
                for alert in active:
                    print(f"  {alert}")

        elif cmd == "remove":
            # remove <item> buy|sell
            if len(parts) < 3:
                print("Usage: remove <item> buy|sell")
                continue
            item_name = parts[1]
            alert_type_str = parts[2].lower()
            if alert_type_str == "buy":
                atype = AlertType.BUY
            elif alert_type_str == "sell":
                atype = AlertType.SELL
            else:
                print("Error: alert type must be 'buy' or 'sell'.")
                continue
            if manager.remove_alert(item_name, atype):
                print(f"Alert removed for '{item_name}' ({alert_type_str}).")
            else:
                print(f"No active {alert_type_str} alert found for '{item_name}'.")

        else:
            print(f"Unknown command: '{cmd}'.  Type 'help' for usage.")


if __name__ == "__main__":
    run_cli(AlertManager())
