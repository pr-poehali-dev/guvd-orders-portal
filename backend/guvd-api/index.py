"""
ГУВД API — CRUD для сотрудников, приказов, взысканий
"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}

def err(msg, code=400):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    resource = params.get("resource", "")
    conn = get_conn()
    cur = conn.cursor()

    try:
        # ── EMPLOYEES ────────────────────────────────────────────
        if resource == "employees":
            if method == "GET":
                cur.execute("SELECT id, name, rank, dept, badge, status FROM employees ORDER BY created_at")
                rows = cur.fetchall()
                return ok([{"id": r[0], "name": r[1], "rank": r[2], "dept": r[3], "badge": r[4], "status": r[5]} for r in rows])

            if method == "POST":
                name = body.get("name", "").strip()
                if not name:
                    return err("name required")
                cur.execute(
                    "INSERT INTO employees (name, rank, dept, badge, status) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (name, body.get("rank", ""), body.get("dept", ""), body.get("badge", ""), body.get("status", "online"))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return ok({"id": new_id})

            if method == "PUT":
                eid = params.get("id")
                if not eid:
                    return err("id required")
                cur.execute(
                    "UPDATE employees SET name=%s, rank=%s, dept=%s, badge=%s, status=%s WHERE id=%s",
                    (body.get("name", ""), body.get("rank", ""), body.get("dept", ""), body.get("badge", ""), body.get("status", "online"), int(eid))
                )
                conn.commit()
                return ok({"ok": True})

            if method == "DELETE":
                eid = params.get("id")
                if not eid:
                    return err("id required")
                cur.execute("UPDATE reprimands SET emp_id = NULL WHERE emp_id = %s", (int(eid),))
                cur.execute("DELETE FROM employees WHERE id = %s", (int(eid),))
                conn.commit()
                return ok({"ok": True})

        # ── ORDERS ───────────────────────────────────────────────
        if resource == "orders":
            if method == "GET":
                cur.execute("SELECT id, order_num, title, date, status, priority FROM orders ORDER BY created_at DESC")
                rows = cur.fetchall()
                return ok([{"id": r[0], "order_num": r[1], "title": r[2], "date": r[3], "status": r[4], "priority": r[5]} for r in rows])

            if method == "POST":
                title = body.get("title", "").strip()
                if not title:
                    return err("title required")
                cur.execute("SELECT COALESCE(MAX(id), 99) FROM orders")
                max_id = cur.fetchone()[0]
                order_num = "№ " + str(max_id + 1)
                cur.execute(
                    "INSERT INTO orders (order_num, title, date, status, priority) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (order_num, title, body.get("date", ""), body.get("status", "Действующий"), body.get("priority", "normal"))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return ok({"id": new_id, "order_num": order_num})

            if method == "PUT":
                oid = params.get("id")
                if not oid:
                    return err("id required")
                cur.execute(
                    "UPDATE orders SET title=%s, date=%s, status=%s, priority=%s WHERE id=%s",
                    (body.get("title", ""), body.get("date", ""), body.get("status", "Действующий"), body.get("priority", "normal"), int(oid))
                )
                conn.commit()
                return ok({"ok": True})

            if method == "DELETE":
                oid = params.get("id")
                if not oid:
                    return err("id required")
                cur.execute("DELETE FROM orders WHERE id = %s", (int(oid),))
                conn.commit()
                return ok({"ok": True})

        # ── REPRIMANDS ───────────────────────────────────────────
        if resource == "reprimands":
            if method == "GET":
                cur.execute("SELECT id, emp_id, type, reason, issued_by, date FROM reprimands ORDER BY created_at DESC")
                rows = cur.fetchall()
                return ok([{"id": r[0], "emp_id": r[1], "type": r[2], "reason": r[3], "issued_by": r[4], "date": r[5]} for r in rows])

            if method == "POST":
                emp_id = body.get("emp_id")
                reason = body.get("reason", "").strip()
                if not emp_id or not reason:
                    return err("emp_id and reason required")
                cur.execute(
                    "INSERT INTO reprimands (emp_id, type, reason, issued_by, date) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (int(emp_id), body.get("type", "Выговор"), reason, body.get("issued_by", ""), body.get("date", ""))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return ok({"id": new_id})

            if method == "DELETE":
                rid = params.get("id")
                if not rid:
                    return err("id required")
                cur.execute("DELETE FROM reprimands WHERE id = %s", (int(rid),))
                conn.commit()
                return ok({"ok": True})

        return err("unknown resource", 404)

    finally:
        cur.close()
        conn.close()
