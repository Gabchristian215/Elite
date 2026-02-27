"""Unit tests for the Elite price alert system."""

import pytest
from price_alert import AlertManager, AlertType, PriceAlert


# ---------------------------------------------------------------------------
# PriceAlert.check
# ---------------------------------------------------------------------------

class TestPriceAlertCheck:
    def test_buy_alert_triggers_when_price_drops_to_target(self):
        alert = PriceAlert("Shoes", AlertType.BUY, target_price=50.00, current_price=60.00)
        assert alert.check(50.00) is True
        assert alert.triggered is True

    def test_buy_alert_triggers_when_price_drops_below_target(self):
        alert = PriceAlert("Shoes", AlertType.BUY, target_price=50.00, current_price=60.00)
        assert alert.check(45.00) is True
        assert alert.triggered is True

    def test_buy_alert_does_not_trigger_when_price_above_target(self):
        alert = PriceAlert("Shoes", AlertType.BUY, target_price=50.00, current_price=60.00)
        assert alert.check(55.00) is False
        assert alert.triggered is False

    def test_sell_alert_triggers_when_price_rises_to_target(self):
        alert = PriceAlert("Shoes", AlertType.SELL, target_price=80.00, current_price=60.00)
        assert alert.check(80.00) is True
        assert alert.triggered is True

    def test_sell_alert_triggers_when_price_rises_above_target(self):
        alert = PriceAlert("Shoes", AlertType.SELL, target_price=80.00, current_price=60.00)
        assert alert.check(90.00) is True
        assert alert.triggered is True

    def test_sell_alert_does_not_trigger_when_price_below_target(self):
        alert = PriceAlert("Shoes", AlertType.SELL, target_price=80.00, current_price=60.00)
        assert alert.check(70.00) is False
        assert alert.triggered is False

    def test_check_updates_current_price(self):
        alert = PriceAlert("Hat", AlertType.BUY, target_price=30.00, current_price=40.00)
        alert.check(38.00)
        assert alert.current_price == 38.00


# ---------------------------------------------------------------------------
# AlertManager.add_alert
# ---------------------------------------------------------------------------

class TestAlertManagerAddAlert:
    def test_add_buy_alert(self):
        mgr = AlertManager()
        alert = mgr.add_alert("Bag", AlertType.BUY, target_price=100.00)
        assert alert.item_name == "Bag"
        assert alert.alert_type == AlertType.BUY
        assert alert.target_price == 100.00
        assert alert in mgr.get_active_alerts()

    def test_add_sell_alert(self):
        mgr = AlertManager()
        alert = mgr.add_alert("Bag", AlertType.SELL, target_price=200.00)
        assert alert.alert_type == AlertType.SELL
        assert alert in mgr.get_active_alerts()

    def test_add_alert_invalid_target_price_raises(self):
        mgr = AlertManager()
        with pytest.raises(ValueError):
            mgr.add_alert("Bag", AlertType.BUY, target_price=0)

    def test_add_multiple_alerts_for_same_item(self):
        mgr = AlertManager()
        mgr.add_alert("Watch", AlertType.BUY, target_price=150.00)
        mgr.add_alert("Watch", AlertType.SELL, target_price=300.00)
        assert len(mgr.get_active_alerts()) == 2


# ---------------------------------------------------------------------------
# AlertManager.update_price
# ---------------------------------------------------------------------------

class TestAlertManagerUpdatePrice:
    def test_buy_alert_triggered_on_price_drop(self):
        notifications = []
        mgr = AlertManager(notify_callback=lambda a, p: notifications.append((a, p)))
        mgr.add_alert("Jacket", AlertType.BUY, target_price=75.00, current_price=90.00)

        triggered = mgr.update_price("Jacket", 70.00)

        assert len(triggered) == 1
        assert len(notifications) == 1
        assert notifications[0][1] == 70.00

    def test_sell_alert_triggered_on_price_rise(self):
        notifications = []
        mgr = AlertManager(notify_callback=lambda a, p: notifications.append((a, p)))
        mgr.add_alert("Jacket", AlertType.SELL, target_price=120.00, current_price=90.00)

        triggered = mgr.update_price("Jacket", 125.00)

        assert len(triggered) == 1
        assert len(notifications) == 1

    def test_no_trigger_when_price_does_not_meet_condition(self):
        notifications = []
        mgr = AlertManager(notify_callback=lambda a, p: notifications.append((a, p)))
        mgr.add_alert("Jacket", AlertType.BUY, target_price=75.00, current_price=90.00)

        triggered = mgr.update_price("Jacket", 80.00)

        assert triggered == []
        assert notifications == []

    def test_triggered_alert_is_not_re_triggered(self):
        notifications = []
        mgr = AlertManager(notify_callback=lambda a, p: notifications.append((a, p)))
        mgr.add_alert("Jacket", AlertType.BUY, target_price=75.00, current_price=90.00)

        mgr.update_price("Jacket", 70.00)   # triggers
        mgr.update_price("Jacket", 60.00)   # should NOT trigger again

        assert len(notifications) == 1

    def test_update_price_invalid_raises(self):
        mgr = AlertManager()
        with pytest.raises(ValueError):
            mgr.update_price("Jacket", 0)

    def test_update_price_only_affects_matching_item(self):
        notifications = []
        mgr = AlertManager(notify_callback=lambda a, p: notifications.append((a, p)))
        mgr.add_alert("Jacket", AlertType.BUY, target_price=75.00)
        mgr.add_alert("Shoes", AlertType.BUY, target_price=50.00)

        triggered = mgr.update_price("Shoes", 45.00)

        assert len(triggered) == 1
        assert triggered[0].item_name == "Shoes"
        assert len(mgr.get_active_alerts()) == 1  # Jacket alert still active


# ---------------------------------------------------------------------------
# AlertManager.remove_alert
# ---------------------------------------------------------------------------

class TestAlertManagerRemoveAlert:
    def test_remove_existing_alert(self):
        mgr = AlertManager()
        mgr.add_alert("Cap", AlertType.BUY, target_price=30.00)
        assert mgr.remove_alert("Cap", AlertType.BUY) is True
        assert mgr.get_active_alerts() == []

    def test_remove_nonexistent_alert_returns_false(self):
        mgr = AlertManager()
        assert mgr.remove_alert("Cap", AlertType.BUY) is False

    def test_remove_does_not_affect_triggered_alerts(self):
        mgr = AlertManager()
        mgr.add_alert("Cap", AlertType.BUY, target_price=30.00, current_price=40.00)
        mgr.update_price("Cap", 25.00)   # triggers the alert
        # remove should return False because alert is already triggered
        assert mgr.remove_alert("Cap", AlertType.BUY) is False


# ---------------------------------------------------------------------------
# AlertManager.get_active_alerts / get_all_alerts
# ---------------------------------------------------------------------------

class TestAlertManagerQueries:
    def test_get_active_alerts_excludes_triggered(self):
        mgr = AlertManager()
        mgr.add_alert("Belt", AlertType.BUY, target_price=20.00, current_price=30.00)
        mgr.add_alert("Belt", AlertType.SELL, target_price=50.00, current_price=30.00)
        mgr.update_price("Belt", 15.00)  # triggers BUY

        active = mgr.get_active_alerts()
        assert len(active) == 1
        assert active[0].alert_type == AlertType.SELL

    def test_get_all_alerts_includes_triggered(self):
        mgr = AlertManager()
        mgr.add_alert("Belt", AlertType.BUY, target_price=20.00, current_price=30.00)
        mgr.update_price("Belt", 15.00)  # triggers

        assert len(mgr.get_all_alerts()) == 1
        assert mgr.get_all_alerts()[0].triggered is True

    def test_str_representation(self):
        alert = PriceAlert("Sneakers", AlertType.BUY, target_price=100.00, current_price=120.00)
        result = str(alert)
        assert "BUY" in result
        assert "Sneakers" in result
        assert "100.00" in result
        assert "active" in result
