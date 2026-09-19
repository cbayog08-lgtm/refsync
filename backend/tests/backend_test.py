"""RefSync OS backend API tests.

Covers Matches CRUD (including new category/half_duration_min + status filter),
Events (goal, card, substitution, double_yellow reason), event ordering,
finish flow (status transition + events preservation).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"')
                break

BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture()
def match_id(api_client):
    resp = api_client.post(f"{API}/matches", json={})
    assert resp.status_code == 200, resp.text
    return resp.json()["id"]


# ---------- Health ----------
class TestHealth:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Matches ----------
class TestMatches:
    def test_create_match_defaults(self, api_client):
        r = api_client.post(f"{API}/matches", json={})
        assert r.status_code == 200
        data = r.json()
        assert data["home_team"] == "LOCAL"
        assert data["away_team"] == "VISITANTE"
        assert data["status"] == "active"
        assert data["category"] == "Aficionado"
        assert data["half_duration_min"] == 45
        assert data["id"]
        assert data["finished_at"] is None

    @pytest.mark.parametrize("category,half", [
        ("Alevín", 30),
        ("Infantil", 35),
        ("Cadete", 40),
        ("Juvenil", 45),
        ("Aficionado", 45),
    ])
    def test_create_match_with_category(self, api_client, category, half):
        r = api_client.post(f"{API}/matches", json={
            "category": category, "half_duration_min": half,
        })
        assert r.status_code == 200
        data = r.json()
        assert data["category"] == category
        assert data["half_duration_min"] == half
        # Verify via GET
        g = api_client.get(f"{API}/matches/{data['id']}")
        assert g.status_code == 200
        gd = g.json()
        assert gd["category"] == category
        assert gd["half_duration_min"] == half

    def test_get_match(self, api_client, match_id):
        r = api_client.get(f"{API}/matches/{match_id}")
        assert r.status_code == 200
        assert r.json()["id"] == match_id

    def test_get_match_not_found(self, api_client):
        r = api_client.get(f"{API}/matches/nope-xyz")
        assert r.status_code == 404

    def test_finish_match(self, api_client, match_id):
        r = api_client.post(f"{API}/matches/{match_id}/finish")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "finished"
        assert data["finished_at"] is not None
        g = api_client.get(f"{API}/matches/{match_id}")
        assert g.json()["status"] == "finished"

    def test_finish_match_not_found(self, api_client):
        r = api_client.post(f"{API}/matches/does-not-exist/finish")
        assert r.status_code == 404

    def test_list_finished_only_and_ordering(self, api_client):
        # Create 3 matches, finish 2 of them
        ids = []
        for cat, hm in [("Cadete", 40), ("Juvenil", 45), ("Alevín", 30)]:
            r = api_client.post(f"{API}/matches", json={
                "category": cat, "half_duration_min": hm,
            })
            assert r.status_code == 200
            ids.append(r.json()["id"])
        # Finish first two
        for mid in ids[:2]:
            assert api_client.post(f"{API}/matches/{mid}/finish").status_code == 200

        r = api_client.get(f"{API}/matches?status=finished")
        assert r.status_code == 200
        finished = r.json()
        finished_ids = {m["id"] for m in finished}
        # First two must be present, third must NOT (still active)
        for mid in ids[:2]:
            assert mid in finished_ids
        assert ids[2] not in finished_ids
        # Every entry has status finished
        assert all(m["status"] == "finished" for m in finished)
        # Sorted desc by created_at
        created = [m["created_at"] for m in finished]
        assert created == sorted(created, reverse=True), f"Not desc: {created}"

    def test_finish_does_not_delete_events(self, api_client, match_id):
        # Add several events then finish and confirm they persist
        payloads = [
            {"type": "goal", "minute": 5, "added_minute": 0, "team": "home", "dorsal": 9},
            {"type": "card", "minute": 12, "added_minute": 0, "team": "away", "dorsal": 5, "card_color": "yellow"},
            {"type": "substitution", "minute": 30, "added_minute": 0, "team": "home", "dorsal_out": 7, "dorsal_in": 11},
        ]
        for p in payloads:
            assert api_client.post(f"{API}/matches/{match_id}/events", json=p).status_code == 200

        before = api_client.get(f"{API}/matches/{match_id}/events").json()
        assert len(before) == 3

        fin = api_client.post(f"{API}/matches/{match_id}/finish")
        assert fin.status_code == 200
        assert fin.json()["status"] == "finished"

        after = api_client.get(f"{API}/matches/{match_id}/events").json()
        assert len(after) == 3
        assert {e["id"] for e in before} == {e["id"] for e in after}


# ---------- Events ----------
class TestEvents:
    def test_goal_event(self, api_client, match_id):
        payload = {"type": "goal", "minute": 10, "added_minute": 0, "team": "home", "dorsal": 9}
        r = api_client.post(f"{API}/matches/{match_id}/events", json=payload)
        assert r.status_code == 200, r.text
        ev = r.json()
        assert ev["type"] == "goal"
        assert ev["team"] == "home"
        assert ev["dorsal"] == 9
        assert ev["minute"] == 10

    def test_card_yellow_event(self, api_client, match_id):
        payload = {"type": "card", "minute": 22, "added_minute": 0, "team": "away", "dorsal": 5, "card_color": "yellow"}
        r = api_client.post(f"{API}/matches/{match_id}/events", json=payload)
        assert r.status_code == 200
        ev = r.json()
        assert ev["card_color"] == "yellow"
        assert ev["team"] == "away"

    def test_card_red_event(self, api_client, match_id):
        payload = {"type": "card", "minute": 40, "added_minute": 2, "team": "home", "dorsal": 4, "card_color": "red"}
        r = api_client.post(f"{API}/matches/{match_id}/events", json=payload)
        assert r.status_code == 200
        assert r.json()["card_color"] == "red"

    def test_card_double_yellow_reason(self, api_client, match_id):
        # Simulate frontend logic: two yellows then an automatic red with reason=double_yellow
        for _ in range(2):
            r = api_client.post(f"{API}/matches/{match_id}/events", json={
                "type": "card", "minute": 20, "added_minute": 0, "team": "home", "dorsal": 8, "card_color": "yellow",
            })
            assert r.status_code == 200
        r = api_client.post(f"{API}/matches/{match_id}/events", json={
            "type": "card", "minute": 20, "added_minute": 0, "team": "home", "dorsal": 8,
            "card_color": "red", "reason": "double_yellow",
        })
        assert r.status_code == 200
        ev = r.json()
        assert ev["card_color"] == "red"
        assert ev["reason"] == "double_yellow"
        # Verify persisted via GET
        listed = api_client.get(f"{API}/matches/{match_id}/events").json()
        reds = [e for e in listed if e["card_color"] == "red" and e["dorsal"] == 8]
        assert len(reds) == 1
        assert reds[0]["reason"] == "double_yellow"

    def test_substitution_event(self, api_client, match_id):
        payload = {"type": "substitution", "minute": 30, "added_minute": 0, "team": "home", "dorsal_out": 7, "dorsal_in": 11}
        r = api_client.post(f"{API}/matches/{match_id}/events", json=payload)
        assert r.status_code == 200
        ev = r.json()
        assert ev["dorsal_out"] == 7
        assert ev["dorsal_in"] == 11

    def test_list_events_ordered(self, api_client, match_id):
        events = [
            {"type": "goal", "minute": 30, "added_minute": 0, "team": "home", "dorsal": 9},
            {"type": "card", "minute": 5, "added_minute": 0, "team": "away", "dorsal": 3, "card_color": "yellow"},
            {"type": "substitution", "minute": 45, "added_minute": 3, "team": "home", "dorsal_out": 7, "dorsal_in": 11},
            {"type": "goal", "minute": 45, "added_minute": 1, "team": "away", "dorsal": 10},
        ]
        for e in events:
            assert api_client.post(f"{API}/matches/{match_id}/events", json=e).status_code == 200

        r = api_client.get(f"{API}/matches/{match_id}/events")
        assert r.status_code == 200
        listed = r.json()
        assert len(listed) == len(events)
        keys = [(e["minute"], e["added_minute"]) for e in listed]
        assert keys == sorted(keys), f"Not ordered: {keys}"

    def test_event_on_missing_match(self, api_client):
        payload = {"type": "goal", "minute": 1, "added_minute": 0, "team": "home", "dorsal": 1}
        r = api_client.post(f"{API}/matches/nonexistent-match/events", json=payload)
        assert r.status_code == 404

    def test_invalid_event_type(self, api_client, match_id):
        r = api_client.post(f"{API}/matches/{match_id}/events", json={
            "type": "foobar", "minute": 1, "added_minute": 0, "team": "home",
        })
        assert r.status_code == 422

    def test_invalid_card_color(self, api_client, match_id):
        r = api_client.post(f"{API}/matches/{match_id}/events", json={
            "type": "card", "minute": 1, "added_minute": 0, "team": "home", "dorsal": 1, "card_color": "green",
        })
        assert r.status_code == 422

    def test_invalid_team(self, api_client, match_id):
        r = api_client.post(f"{API}/matches/{match_id}/events", json={
            "type": "goal", "minute": 1, "added_minute": 0, "team": "guest", "dorsal": 1,
        })
        assert r.status_code == 422


# ---------- Pairing (pair_code + by-code + lineups) ----------
class TestPairing:
    def test_create_returns_6_digit_pair_code(self, api_client):
        r = api_client.post(f"{API}/matches", json={"home_team": "TEST_HOME", "away_team": "TEST_AWAY"})
        assert r.status_code == 200
        data = r.json()
        code = data.get("pair_code")
        assert isinstance(code, str)
        assert len(code) == 6
        assert code.isdigit()

    def test_create_persists_lineup_enabled_and_lineups(self, api_client):
        lineups = {
            "home": {"onField": [1, 7, 10], "bench": [12, 15]},
            "away": {"onField": [3, 9], "bench": [11]},
        }
        r = api_client.post(f"{API}/matches", json={
            "home_team": "TEST_L_H", "away_team": "TEST_L_A",
            "lineup_enabled": True, "lineups": lineups,
        })
        assert r.status_code == 200
        data = r.json()
        assert data["lineup_enabled"] is True
        assert data["lineups"] == lineups
        # GET verifies persistence
        g = api_client.get(f"{API}/matches/{data['id']}")
        assert g.status_code == 200
        gd = g.json()
        assert gd["lineup_enabled"] is True
        assert gd["lineups"] == lineups

    def test_get_by_code_returns_active_match(self, api_client):
        payload = {
            "home_team": "TEST_BC_H", "away_team": "TEST_BC_A",
            "home_color": "#123456", "away_color": "#654321",
            "category": "Juvenil", "half_duration_min": 45,
            "lineup_enabled": True,
            "lineups": {"home": {"onField": [1], "bench": []}, "away": {"onField": [2], "bench": []}},
        }
        r = api_client.post(f"{API}/matches", json=payload)
        assert r.status_code == 200
        created = r.json()
        code = created["pair_code"]
        g = api_client.get(f"{API}/matches/by-code/{code}")
        assert g.status_code == 200, g.text
        d = g.json()
        assert d["id"] == created["id"]
        assert d["home_team"] == "TEST_BC_H"
        assert d["home_color"] == "#123456"
        assert d["away_color"] == "#654321"
        assert d["category"] == "Juvenil"
        assert d["lineup_enabled"] is True
        assert d["lineups"] == payload["lineups"]
        assert d["status"] == "active"

    def test_get_by_code_404_when_missing(self, api_client):
        # A code guaranteed not to exist (7 chars won't match Any real 6-digit codes)
        r = api_client.get(f"{API}/matches/by-code/000000000")
        assert r.status_code == 404

    def test_get_by_code_404_when_finished(self, api_client):
        r = api_client.post(f"{API}/matches", json={"home_team": "TEST_FIN"})
        assert r.status_code == 200
        m = r.json()
        code = m["pair_code"]
        # Sanity: active fetch works
        assert api_client.get(f"{API}/matches/by-code/{code}").status_code == 200
        # Finish, then by-code should 404
        f = api_client.post(f"{API}/matches/{m['id']}/finish")
        assert f.status_code == 200
        r2 = api_client.get(f"{API}/matches/by-code/{code}")
        assert r2.status_code == 404

    def test_get_by_code_returns_latest_active(self, api_client):
        # Create two active matches; if unique code happens to be shared (astronomically unlikely),
        # the endpoint should return the most recent by created_at.
        r1 = api_client.post(f"{API}/matches", json={"home_team": "TEST_LATEST_1"})
        r2 = api_client.post(f"{API}/matches", json={"home_team": "TEST_LATEST_2"})
        assert r1.status_code == 200 and r2.status_code == 200
        code2 = r2.json()["pair_code"]
        g = api_client.get(f"{API}/matches/by-code/{code2}")
        assert g.status_code == 200
        assert g.json()["id"] == r2.json()["id"]

