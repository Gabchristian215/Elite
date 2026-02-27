"""
Elite Resell Price Alert System

Notifies you when a price drops (buy signal) or rises (sell signal).
"""

import datetime
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, List, Optional


class AlertType(Enum):
    BUY = "buy"    # Notify when price drops to or below target price
    SELL = "sell"  # Notify when price rises to or above target price


@dataclass
class PriceAlert:
    """Represents a single price alert for an item."""

    item_name: str
    alert_type: AlertType
    target_price: float
    current_price: float
    created_at: datetime.datetime = field(default_factory=datetime.datetime.now)
    triggered: bool = False

    def check(self, new_price: float) -> bool:
        """
        Check whether the alert condition is met for the given price.

        Returns True (and marks the alert as triggered) if:
        - AlertType.BUY  and new_price <= target_price
        - AlertType.SELL and new_price >= target_price
        """
        self.current_price = new_price
        if self.alert_type == AlertType.BUY and new_price <= self.target_price:
            self.triggered = True
            return True
        if self.alert_type == AlertType.SELL and new_price >= self.target_price:
            self.triggered = True
            return True
        return False

    def __str__(self) -> str:
        status = "triggered" if self.triggered else "active"
        return (
            f"[{self.alert_type.value.upper()}] {self.item_name} | "
            f"target: ${self.target_price:.2f} | "
            f"current: ${self.current_price:.2f} | "
            f"{status}"
        )


class AlertManager:
    """Manages a collection of price alerts and dispatches notifications."""

    def __init__(self, notify_callback: Optional[Callable[["PriceAlert", float], None]] = None):
        self._alerts: List[PriceAlert] = []
        self._notify: Callable[["PriceAlert", float], None] = (
            notify_callback if notify_callback is not None else self._default_notify
        )

    # ------------------------------------------------------------------
    # Alert lifecycle
    # ------------------------------------------------------------------

    def add_alert(
        self,
        item_name: str,
        alert_type: AlertType,
        target_price: float,
        current_price: float = 0.0,
    ) -> PriceAlert:
        """Create and store a new price alert. Returns the new alert."""
        if target_price <= 0:
            raise ValueError("target_price must be greater than zero.")
        alert = PriceAlert(
            item_name=item_name,
            alert_type=alert_type,
            target_price=target_price,
            current_price=current_price,
        )
        self._alerts.append(alert)
        return alert

    def remove_alert(self, item_name: str, alert_type: AlertType) -> bool:
        """Remove the first matching untriggered alert. Returns True if found."""
        for i, alert in enumerate(self._alerts):
            if alert.item_name == item_name and alert.alert_type == alert_type and not alert.triggered:
                self._alerts.pop(i)
                return True
        return False

    # ------------------------------------------------------------------
    # Price updates
    # ------------------------------------------------------------------

    def update_price(self, item_name: str, new_price: float) -> List[PriceAlert]:
        """
        Update the price for *item_name* and check all active alerts for that item.

        Returns a list of alerts that were triggered by this update.
        """
        if new_price <= 0:
            raise ValueError("new_price must be greater than zero.")
        triggered: List[PriceAlert] = []
        for alert in self._alerts:
            if alert.item_name == item_name and not alert.triggered:
                if alert.check(new_price):
                    self._notify(alert, new_price)
                    triggered.append(alert)
        return triggered

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_active_alerts(self) -> List[PriceAlert]:
        """Return all alerts that have not yet been triggered."""
        return [a for a in self._alerts if not a.triggered]

    def get_all_alerts(self) -> List[PriceAlert]:
        """Return every alert (active and triggered)."""
        return list(self._alerts)

    # ------------------------------------------------------------------
    # Default notification
    # ------------------------------------------------------------------

    @staticmethod
    def _default_notify(alert: PriceAlert, new_price: float) -> None:
        action = "BUY  🟢" if alert.alert_type == AlertType.BUY else "SELL 🔴"
        print(
            f"[PRICE ALERT] {action} | {alert.item_name} "
            f"hit ${new_price:.2f} (target: ${alert.target_price:.2f})"
        )
