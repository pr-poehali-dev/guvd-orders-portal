const BASE = "https://functions.poehali.dev/7bc88fc5-b2bc-45b2-a60b-e49b4321bde7";

export type Employee = { id: number; name: string; rank: string; dept: string; badge: string; status: string };
export type Order = { id: number; order_num: string; title: string; date: string; status: string; priority: string };
export type Reprimand = { id: number; emp_id: number; type: string; reason: string; issued_by: string; date: string };

async function req(resource: string, method: string, body?: object, id?: number) {
  const url = new URL(BASE);
  url.searchParams.set("resource", resource);
  if (id !== undefined) url.searchParams.set("id", String(id));
  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export const api = {
  employees: {
    list: (): Promise<Employee[]> => req("employees", "GET"),
    add: (data: Omit<Employee, "id">): Promise<{ id: number }> => req("employees", "POST", data),
    update: (id: number, data: Omit<Employee, "id">) => req("employees", "PUT", data, id),
    remove: (id: number) => req("employees", "DELETE", undefined, id),
  },
  orders: {
    list: (): Promise<Order[]> => req("orders", "GET"),
    add: (data: Omit<Order, "id" | "order_num">): Promise<{ id: number; order_num: string }> => req("orders", "POST", data),
    update: (id: number, data: Omit<Order, "id" | "order_num">) => req("orders", "PUT", data, id),
    remove: (id: number) => req("orders", "DELETE", undefined, id),
  },
  reprimands: {
    list: (): Promise<Reprimand[]> => req("reprimands", "GET"),
    add: (data: Omit<Reprimand, "id">): Promise<{ id: number }> => req("reprimands", "POST", data),
    remove: (id: number) => req("reprimands", "DELETE", undefined, id),
  },
};
