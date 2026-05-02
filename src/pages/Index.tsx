import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import OrderGenerator from "@/components/OrderGenerator";
import WantedList from "@/components/WantedList";
import { api } from "@/api/guvd";
import type { Employee as ApiEmployee, Order as ApiOrder, Reprimand as ApiReprimand } from "@/api/guvd";

type Role = "guest" | "employee" | "commander";
type Section = "home" | "orders" | "employees" | "management" | "documents" | "contacts" | "cabinet" | "generator" | "wanted";

const CREST_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Emblem_of_the_Ministry_of_Internal_Affairs.svg/960px-Emblem_of_the_Ministry_of_Internal_Affairs.svg.png";

type Employee = ApiEmployee;
type Order = ApiOrder;
type Reprimand = ApiReprimand;

const emptyEmployee: Omit<Employee, "id"> = { rank: "", name: "", dept: "", badge: "", status: "online" };
const emptyOrder: Omit<Order, "id" | "order_num"> = { date: "", title: "", status: "Действующий", priority: "normal" };

const RANKS = ["Рядовой", "Младший сержант", "Сержант", "Старший сержант", "Прапорщик", "Лейтенант", "Старший лейтенант", "Капитан", "Майор", "Подполковник", "Полковник", "Генерал-майор"];
const DEPTS = ["Командование", "Оперативный отдел", "Патрульная служба", "Следственный отдел", "ДПС", "Дежурная часть", "Кинологический отдел"];

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const mockDocuments = [
  { id: 1, title: "Устав ГУВД Провинции", type: "Нормативный акт", date: "01.01.2026", size: "124 КБ" },
  { id: 2, title: "Регламент несения службы", type: "Инструкция", date: "10.02.2026", size: "87 КБ" },
  { id: 3, title: "Форма рапорта об инциденте", type: "Бланк", date: "15.03.2026", size: "32 КБ" },
  { id: 4, title: "Кодекс поведения сотрудника", type: "Нормативный акт", date: "01.01.2026", size: "56 КБ" },
  { id: 5, title: "Схема патрульных маршрутов", type: "Карта", date: "20.03.2026", size: "210 КБ" },
];

export default function Index() {
  const [role, setRole] = useState<Role>("guest");
  const [section, setSection] = useState<Section>("home");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<"employee" | "commander">("employee");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);

  // Employees state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empFormOpen, setEmpFormOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<Omit<Employee, "id">>(emptyEmployee);
  const [fireConfirm, setFireConfirm] = useState<Employee | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState<Omit<Order, "id" | "order_num">>(emptyOrder);
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState("Все");

  // Reprimands state
  const [reprimands, setReprimands] = useState<Reprimand[]>([]);
  const [repFormOpen, setRepFormOpen] = useState(false);
  const [repForm, setRepForm] = useState({ emp_id: 0, type: "Выговор", reason: "", issued_by: "" });
  const [deleteRepConfirm, setDeleteRepConfirm] = useState<Reprimand | null>(null);

  // Management tab
  const [mgmtTab, setMgmtTab] = useState<"employees" | "orders" | "reprimands">("employees");

  // Load data from API on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [emps, ords, reps] = await Promise.all([
        api.employees.list(),
        api.orders.list(),
        api.reprimands.list(),
      ]);
      setEmployees(emps);
      setOrders(ords);
      setReprimands(reps);
      setLoading(false);
    };
    load();
  }, []);

  const navItems: { id: Section; label: string; icon: string; restricted?: boolean; guestHidden?: boolean }[] = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "wanted", label: "Розыск", icon: "AlertOctagon", guestHidden: true },
    { id: "orders", label: "Приказы", icon: "FileText", restricted: true, guestHidden: true },
    { id: "employees", label: "Сотрудники", icon: "Users", restricted: true, guestHidden: true },
    { id: "generator", label: "Генератор приказов", icon: "FilePen", restricted: true, guestHidden: true },
    { id: "management", label: "Управление", icon: "Settings", restricted: true, guestHidden: true },
    { id: "documents", label: "Документы", icon: "FolderOpen", restricted: true, guestHidden: true },
    { id: "contacts", label: "Контакты", icon: "Phone" },
    { id: "cabinet", label: "Кабинет", icon: "UserCircle", restricted: true, guestHidden: true },
  ];

  const handleNav = (id: Section, restricted?: boolean) => {
    if (restricted && role === "guest") { setLoginOpen(true); return; }
    setSection(id);
    setMobileMenuOpen(false);
  };

  const handleLogin = () => { setRole(loginRole); setLoginOpen(false); setSection("cabinet"); };
  const handleLogout = () => { setRole("guest"); setSection("home"); };

  // Computed stats
  const activeOrders = orders.filter(o => o.status === "Действующий").length;
  const onlineCount = employees.filter(e => e.status === "online").length;
  const repCount = reprimands.length;

  // Order helpers
  const saveOrder = async () => {
    if (!orderForm.title.trim()) return;
    const data = { ...orderForm, date: orderForm.date || todayStr() };
    if (editOrder) {
      await api.orders.update(editOrder.id, data);
      setOrders(p => p.map(o => o.id === editOrder.id ? { ...o, ...data } : o));
    } else {
      const res = await api.orders.add(data);
      setOrders(p => [{ ...data, id: res.id, order_num: res.order_num }, ...p]);
    }
    setOrderFormOpen(false); setEditOrder(null); setOrderForm(emptyOrder);
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === "Все") return true;
    if (orderFilter === "Действующие") return o.status === "Действующий";
    if (orderFilter === "Архив") return o.status === "Архив";
    if (orderFilter === "Срочные") return o.priority === "high";
    return true;
  });

  // Employee helpers
  const saveEmployee = async () => {
    if (!empForm.name.trim()) return;
    if (editEmp) {
      await api.employees.update(editEmp.id, empForm);
      setEmployees(p => p.map(e => e.id === editEmp.id ? { ...empForm, id: editEmp.id } : e));
    } else {
      const res = await api.employees.add(empForm);
      setEmployees(p => [...p, { ...empForm, id: res.id }]);
    }
    setEmpFormOpen(false); setEditEmp(null); setEmpForm(emptyEmployee);
  };

  // Reprimand helpers
  const saveReprimand = async () => {
    if (!repForm.emp_id || !repForm.reason.trim()) return;
    const data = { ...repForm, date: todayStr() };
    const res = await api.reprimands.add(data);
    setReprimands(p => [...p, { ...data, id: res.id }]);
    setRepFormOpen(false); setRepForm({ emp_id: 0, type: "Выговор", reason: "", issued_by: "" });
  };

  const getEmpName = (id: number | null) => id ? (employees.find(e => e.id === id)?.name ?? "—") : "—";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(216,30%,96%)" }}>

      {/* Top bar */}
      <div className="bg-navy py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-white/60 font-ibm">
          <span>Сервер: <span className="text-white/90 font-medium">Провинция МТА · Сервер 1</span></span>
          <span className="hidden sm:block">Официальный портал ГУВД · 2026</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-navy-mid header-pattern shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <img src={CREST_URL} alt="Герб ГУВД" className="w-14 h-14 rounded-full border-2 border-gold object-cover flex-shrink-0 shadow-md" />
          <div className="flex-1 min-w-0">
            <h1 className="font-oswald text-white text-xl sm:text-2xl font-semibold tracking-wide leading-tight">ГУВД · Провинция</h1>
            <p className="text-white/60 text-xs font-ibm tracking-wider uppercase mt-0.5">Главное Управление Внутренних Дел · MTA Server 1</p>
          </div>
          <div className="flex items-center gap-3">
            {role === "guest" ? (
              <button onClick={() => setLoginOpen(true)} className="flex items-center gap-2 bg-gold hover:bg-yellow-400 text-navy font-oswald font-semibold px-4 py-2 text-sm tracking-wide transition-colors rounded">
                <Icon name="LogIn" size={15} />Войти
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-white text-sm font-oswald">{role === "commander" ? "Руководящий состав" : "Сотрудник"}</span>
                  <span className="text-gold-light text-xs font-ibm">{role === "commander" ? "★ Командование" : "● На службе"}</span>
                </div>
                <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors p-1.5" title="Выйти">
                  <Icon name="LogOut" size={18} />
                </button>
              </div>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden text-white/80 hover:text-white p-1">
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        <nav className={`bg-navy border-t border-white/10 ${mobileMenuOpen ? "block" : "hidden sm:block"}`}>
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex flex-col sm:flex-row">
              {navItems.filter(item => !(item.guestHidden && role === "guest")).map((item) => {
                const isActive = section === item.id;
                const locked = item.restricted && role === "guest";
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNav(item.id, item.restricted)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-oswald tracking-wide w-full sm:w-auto transition-colors ${isActive ? "text-gold border-b-2 border-gold bg-white/5" : locked ? "text-white/40 hover:text-white/60" : "text-white/75 hover:text-white hover:bg-white/5"}`}
                    >
                      <Icon name={item.icon} size={15} />
                      {item.label}
                      {locked && <Icon name="Lock" size={11} className="ml-0.5 opacity-50" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground font-ibm text-sm">
            <Icon name="Loader" size={18} className="animate-spin" />
            Загрузка данных...
          </div>
        )}


        {/* HOME */}
        {section === "home" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-navy-mid rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 header-pattern opacity-50" />
              <div className="relative px-6 py-10 sm:py-14 flex flex-col sm:flex-row items-center gap-6">
                <img src={CREST_URL} alt="Герб" className="w-24 h-24 rounded-full border-4 border-gold object-cover shadow-xl flex-shrink-0" />
                <div>
                  <div className="text-gold text-xs font-oswald tracking-widest uppercase mb-2">Официальный портал</div>
                  <h2 className="font-oswald text-white text-3xl sm:text-4xl font-bold leading-tight">ГУВД Провинции</h2>
                  <p className="text-white/60 font-ibm text-sm mt-2 max-w-xl leading-relaxed">
                    Внутренний информационный портал Главного Управления Внутренних Дел игрового сервера МТА Провинция (Сервер 1). Доступ к приказам, документам и личному кабинету требует авторизации.
                  </p>
                  {role === "guest" && (
                    <button onClick={() => setLoginOpen(true)} className="mt-4 bg-gold hover:bg-yellow-400 text-navy font-oswald font-semibold px-6 py-2.5 text-sm tracking-wide transition-colors rounded inline-flex items-center gap-2">
                      <Icon name="LogIn" size={16} />Войти в систему
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Сотрудников", value: String(employees.length), icon: "Users" },
                { label: "Активных приказов", value: String(activeOrders), icon: "FileText" },
                { label: "Взысканий", value: String(repCount), icon: "AlertTriangle" },
                { label: "На службе", value: String(onlineCount), icon: "Shield" },
              ].map((stat, i) => (
                <div key={stat.label} className={`bg-white rounded-lg p-4 border border-border card-hover animate-slide-up animate-stagger-${i + 1}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-xs font-ibm uppercase tracking-wide">{stat.label}</span>
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                      <Icon name={stat.icon} size={15} className="text-navy-light" />
                    </div>
                  </div>
                  <div className="font-oswald text-3xl text-navy font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="bg-navy px-4 py-3 flex items-center justify-between">
                  <span className="font-oswald text-white text-sm tracking-wide">Последние приказы</span>
                  <button onClick={() => handleNav("orders", true)} className="text-gold-light text-xs hover:text-gold font-ibm transition-colors">Все приказы →</button>
                </div>
                <div className="divide-y divide-border">
                  {orders.length === 0 ? (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm font-ibm">Приказов пока нет</div>
                  ) : orders.slice(0, 3).map((o) => (
                    <div key={o.id} className="px-4 py-3 ribbon-line pl-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-oswald text-navy text-xs font-semibold">{o.id}</span>
                        <span className="text-muted-foreground text-xs font-ibm">· {o.date}</span>
                        {o.priority === "high" && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-ibm">Срочный</span>}
                      </div>
                      <p className="text-sm font-ibm text-foreground leading-snug">{o.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="bg-navy px-4 py-3 flex items-center justify-between">
                  <span className="font-oswald text-white text-sm tracking-wide">Сотрудники онлайн</span>
                  <button onClick={() => handleNav("employees", true)} className="text-gold-light text-xs hover:text-gold font-ibm transition-colors">Все →</button>
                </div>
                <div className="divide-y divide-border">
                  {employees.filter(e => e.status === "online").length === 0 ? (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm font-ibm">Никого нет на службе</div>
                  ) : employees.filter(e => e.status === "online").map((emp) => (
                    <div key={emp.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="User" size={16} className="text-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-ibm text-sm font-medium text-foreground truncate">{emp.name}</div>
                        <div className="text-xs text-muted-foreground font-ibm">{emp.rank} · {emp.dept}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {section === "orders" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-oswald text-2xl text-navy font-semibold">Приказы</h2>
                <p className="text-muted-foreground text-sm font-ibm">Реестр действующих и архивных приказов ГУВД</p>
              </div>
              {role === "commander" && (
                <button onClick={() => { setEditOrder(null); setOrderForm(emptyOrder); setOrderFormOpen(true); }} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-oswald font-medium px-4 py-2 text-sm tracking-wide transition-colors rounded">
                  <Icon name="Plus" size={16} />Создать приказ
                </button>
              )}
            </div>
            <div className="bg-white rounded-lg border border-border px-4 py-3 flex flex-wrap gap-2">
              {["Все", "Действующие", "Архив", "Срочные"].map((f) => (
                <button key={f} onClick={() => setOrderFilter(f)} className={`px-3 py-1.5 text-xs font-oswald tracking-wide rounded transition-colors ${orderFilter === f ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10 hover:text-navy"}`}>{f}</button>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-10 text-center">
                  <Icon name="FileText" size={36} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground font-ibm text-sm">Приказов нет{orderFilter !== "Все" ? " в этой категории" : ""}</p>
                </div>
              ) : (
                <table className="w-full text-sm font-ibm">
                  <thead>
                    <tr className="bg-navy/5 border-b border-border">
                      <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Номер</th>
                      <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Дата</th>
                      <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Наименование</th>
                      <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide hidden sm:table-cell">Статус</th>
                      {role === "commander" && <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Действия</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-navy font-oswald">{order.order_num}</td>
                        <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{order.date}</td>
                        <td className="px-4 py-3.5 text-foreground">
                          <div className="flex items-center gap-2">
                            {order.priority === "high" && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex-shrink-0">Срочный</span>}
                            {order.title}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className={`text-xs px-2 py-1 rounded font-ibm ${order.status === "Действующий" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{order.status}</span>
                        </td>
                        {role === "commander" && (
                          <td className="px-4 py-3.5">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditOrder(order); setOrderForm({ date: order.date, title: order.title, status: order.status, priority: order.priority }); setOrderFormOpen(true); }} className="text-muted-foreground hover:text-navy transition-colors" title="Редактировать"><Icon name="Pencil" size={15} /></button>
                              <button onClick={() => setDeleteOrderConfirm(order)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Удалить"><Icon name="Trash2" size={15} /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ORDER FORM MODAL */}
            {orderFormOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setOrderFormOpen(false)}>
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                  <div className="bg-navy px-5 py-4 flex items-center justify-between">
                    <span className="font-oswald text-white tracking-wide flex items-center gap-2">
                      <Icon name={editOrder ? "Pencil" : "Plus"} size={16} />
                      {editOrder ? "Редактировать приказ" : "Создать приказ"}
                    </span>
                    <button onClick={() => setOrderFormOpen(false)} className="text-white/70 hover:text-white"><Icon name="X" size={18} /></button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Наименование *</label>
                      <input value={orderForm.title} onChange={e => setOrderForm(p => ({ ...p, title: e.target.value }))} placeholder="О проведении инструктажа..." className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Дата (пусто = сегодня)</label>
                      <input value={orderForm.date} onChange={e => setOrderForm(p => ({ ...p, date: e.target.value }))} placeholder={todayStr()} className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Статус</label>
                      <div className="flex gap-2">
                        {["Действующий", "Архив"].map(s => (
                          <button key={s} onClick={() => setOrderForm(p => ({ ...p, status: s }))} className={`flex-1 py-2 rounded text-xs font-oswald tracking-wide border transition-colors ${orderForm.status === s ? "bg-navy text-white border-navy" : "border-border text-muted-foreground hover:border-navy/30"}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Приоритет</label>
                      <div className="flex gap-2">
                        {[{ v: "normal", l: "Обычный" }, { v: "high", l: "Срочный" }].map(p => (
                          <button key={p.v} onClick={() => setOrderForm(prev => ({ ...prev, priority: p.v }))} className={`flex-1 py-2 rounded text-xs font-oswald tracking-wide border transition-colors ${orderForm.priority === p.v ? (p.v === "high" ? "bg-red-600 text-white border-red-600" : "bg-navy text-white border-navy") : "border-border text-muted-foreground hover:border-navy/30"}`}>{p.l}</button>
                        ))}
                      </div>
                    </div>
                    <button disabled={!orderForm.title.trim()} onClick={saveOrder} className="w-full bg-navy hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald font-semibold py-3 tracking-wide transition-colors rounded mt-1">
                      {editOrder ? "Сохранить" : "Создать приказ"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DELETE ORDER CONFIRM */}
            {deleteOrderConfirm && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setDeleteOrderConfirm(null)}>
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-slide-up p-6" onClick={e => e.stopPropagation()}>
                  <h3 className="font-oswald text-navy text-lg mb-2">Удалить приказ?</h3>
                  <p className="text-muted-foreground text-sm font-ibm mb-5">«{deleteOrderConfirm.title}» будет удалён без возможности восстановления.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteOrderConfirm(null)} className="flex-1 border border-border rounded py-2.5 text-sm font-oswald text-muted-foreground hover:text-navy transition-colors">Отмена</button>
                    <button onClick={async () => { await api.orders.remove(deleteOrderConfirm.id); setOrders(p => p.filter(o => o.id !== deleteOrderConfirm.id)); setDeleteOrderConfirm(null); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2.5 text-sm font-oswald transition-colors">Удалить</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EMPLOYEES */}
        {section === "employees" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-oswald text-2xl text-navy font-semibold">Личный состав</h2>
                <p className="text-muted-foreground text-sm font-ibm">Реестр сотрудников ГУВД Провинции · {employees.length} чел.</p>
              </div>
              {role === "commander" && (
                <button onClick={() => { setEditEmp(null); setEmpForm(emptyEmployee); setEmpFormOpen(true); }} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-oswald font-medium px-4 py-2 text-sm tracking-wide transition-colors rounded">
                  <Icon name="UserPlus" size={16} />Принять сотрудника
                </button>
              )}
            </div>
            {employees.length === 0 ? (
              <div className="bg-white rounded-lg border border-border p-10 text-center">
                <Icon name="Users" size={40} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-ibm text-sm">Сотрудников пока нет</p>
                {role === "commander" && <p className="text-muted-foreground font-ibm text-xs mt-1">Добавьте первого через кнопку «Принять сотрудника»</p>}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((emp, i) => (
                  <div key={emp.id} className={`bg-white rounded-lg border border-border p-4 card-hover animate-slide-up animate-stagger-${Math.min(i + 1, 6)}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 border-2 border-navy/20">
                        <Icon name="User" size={22} className="text-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-oswald text-navy font-semibold text-sm truncate">{emp.name}</h3>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${emp.status === "online" ? "bg-green-500" : "bg-gray-300"}`} title={emp.status === "online" ? "На службе" : "Не в сети"} />
                        </div>
                        <div className="text-xs text-muted-foreground font-ibm">{emp.rank}</div>
                        <div className="text-xs text-muted-foreground font-ibm mt-0.5">{emp.dept}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-oswald text-navy/60 tracking-wide">Жетон: {emp.badge || "—"}</span>
                      {role === "commander" && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditEmp(emp); setEmpForm({ rank: emp.rank, name: emp.name, dept: emp.dept, badge: emp.badge, status: emp.status }); setEmpFormOpen(true); }} className="text-muted-foreground hover:text-navy transition-colors" title="Редактировать"><Icon name="Pencil" size={14} /></button>
                          <button onClick={() => setFireConfirm(emp)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Уволить"><Icon name="UserMinus" size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EMP FORM MODAL */}
            {empFormOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setEmpFormOpen(false)}>
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                  <div className="bg-navy px-5 py-4 flex items-center justify-between">
                    <span className="font-oswald text-white tracking-wide flex items-center gap-2">
                      <Icon name={editEmp ? "Pencil" : "UserPlus"} size={16} />
                      {editEmp ? "Редактировать сотрудника" : "Принять сотрудника"}
                    </span>
                    <button onClick={() => setEmpFormOpen(false)} className="text-white/70 hover:text-white"><Icon name="X" size={18} /></button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Имя / Ник *</label>
                      <input value={empForm.name} onChange={e => setEmpForm(p => ({ ...p, name: e.target.value }))} placeholder="Иван Морозов" className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Звание</label>
                      <select value={empForm.rank} onChange={e => setEmpForm(p => ({ ...p, rank: e.target.value }))} className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all bg-white">
                        <option value="">— Выбрать —</option>
                        {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Подразделение</label>
                      <select value={empForm.dept} onChange={e => setEmpForm(p => ({ ...p, dept: e.target.value }))} className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all bg-white">
                        <option value="">— Выбрать —</option>
                        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Номер жетона</label>
                      <input value={empForm.badge} onChange={e => setEmpForm(p => ({ ...p, badge: e.target.value }))} placeholder="ГУ-055" className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Статус</label>
                      <div className="flex gap-3">
                        {(["online", "offline"] as const).map(s => (
                          <button key={s} onClick={() => setEmpForm(p => ({ ...p, status: s }))} className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-oswald tracking-wide border transition-colors ${empForm.status === s ? "bg-navy text-white border-navy" : "border-border text-muted-foreground hover:border-navy/30"}`}>
                            <div className={`w-2 h-2 rounded-full ${s === "online" ? "bg-green-400" : "bg-gray-400"}`} />
                            {s === "online" ? "На службе" : "Не в сети"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button disabled={!empForm.name.trim()} onClick={saveEmployee} className="w-full bg-navy hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald font-semibold py-3 tracking-wide transition-colors rounded mt-1">
                      {editEmp ? "Сохранить изменения" : "Принять на службу"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FIRE CONFIRM */}
            {fireConfirm && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setFireConfirm(null)}>
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-slide-up p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="UserMinus" size={18} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-oswald text-navy text-lg">Уволить сотрудника?</h3>
                      <p className="text-sm font-ibm text-muted-foreground">{fireConfirm.rank} {fireConfirm.name}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm font-ibm mb-5">Сотрудник будет удалён из реестра личного состава.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setFireConfirm(null)} className="flex-1 border border-border rounded py-2.5 text-sm font-oswald text-muted-foreground hover:text-navy transition-colors">Отмена</button>
                    <button onClick={async () => { await api.employees.remove(fireConfirm.id); setEmployees(p => p.filter(e => e.id !== fireConfirm.id)); setReprimands(p => p.filter(r => r.emp_id !== fireConfirm.id)); setFireConfirm(null); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2.5 text-sm font-oswald transition-colors">Уволить</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WANTED */}
        {section === "wanted" && <WantedList canEdit={role === "employee" || role === "commander"} />}

        {/* GENERATOR */}
        {section === "generator" && <OrderGenerator />}

        {/* MANAGEMENT */}
        {section === "management" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="font-oswald text-2xl text-navy font-semibold">Управление</h2>
              <p className="text-muted-foreground text-sm font-ibm">Инструменты руководящего состава ГУВД</p>
            </div>
            {role !== "commander" ? (
              <div className="bg-white rounded-lg border border-border p-8 text-center">
                <Icon name="ShieldOff" size={40} className="mx-auto text-muted-foreground mb-3" />
                <h3 className="font-oswald text-navy text-lg mb-2">Доступ ограничен</h3>
                <p className="text-muted-foreground text-sm font-ibm">Этот раздел доступен только руководящему составу ГУВД</p>
              </div>
            ) : (
              <>
                {/* Management Tabs */}
                <div className="flex rounded-lg border border-border overflow-hidden bg-white w-fit">
                  {([
                    { id: "employees", label: "Сотрудники", icon: "Users" },
                    { id: "orders", label: "Приказы", icon: "FileText" },
                    { id: "reprimands", label: "Взыскания", icon: "AlertTriangle" },
                  ] as { id: typeof mgmtTab; label: string; icon: string }[]).map((t, i) => (
                    <button key={t.id} onClick={() => setMgmtTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-oswald tracking-wide transition-colors ${i > 0 ? "border-l border-border" : ""} ${mgmtTab === t.id ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"}`}>
                      <Icon name={t.icon} size={14} />{t.label}
                    </button>
                  ))}
                </div>

                {/* TAB: EMPLOYEES */}
                {mgmtTab === "employees" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-oswald text-navy text-sm tracking-wide">Всего сотрудников: {employees.length}</span>
                      <button onClick={() => { setEditEmp(null); setEmpForm(emptyEmployee); setEmpFormOpen(true); }} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-oswald font-medium px-4 py-2 text-sm tracking-wide transition-colors rounded">
                        <Icon name="UserPlus" size={15} />Принять
                      </button>
                    </div>
                    {employees.length === 0 ? (
                      <div className="bg-white rounded-lg border border-border p-8 text-center">
                        <Icon name="Users" size={32} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground font-ibm text-sm">Список пуст. Добавьте первого сотрудника.</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm font-ibm">
                          <thead>
                            <tr className="bg-navy/5 border-b border-border">
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Сотрудник</th>
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide hidden sm:table-cell">Подразделение</th>
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide hidden sm:table-cell">Жетон</th>
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Статус</th>
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Действия</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {employees.map(emp => (
                              <tr key={emp.id} className="hover:bg-muted/40 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-foreground">{emp.name}</div>
                                  <div className="text-xs text-muted-foreground">{emp.rank}</div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{emp.dept || "—"}</td>
                                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell font-oswald text-xs">{emp.badge || "—"}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs px-2 py-1 rounded font-ibm ${emp.status === "online" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {emp.status === "online" ? "На службе" : "Не в сети"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button onClick={() => { setEditEmp(emp); setEmpForm({ rank: emp.rank, name: emp.name, dept: emp.dept, badge: emp.badge, status: emp.status }); setEmpFormOpen(true); }} className="text-muted-foreground hover:text-navy transition-colors" title="Редактировать"><Icon name="Pencil" size={14} /></button>
                                    <button onClick={() => setFireConfirm(emp)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Уволить"><Icon name="UserMinus" size={14} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: ORDERS */}
                {mgmtTab === "orders" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-oswald text-navy text-sm tracking-wide">Приказов: {orders.length} · Действующих: {activeOrders}</span>
                      <button onClick={() => { setEditOrder(null); setOrderForm(emptyOrder); setOrderFormOpen(true); }} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-oswald font-medium px-4 py-2 text-sm tracking-wide transition-colors rounded">
                        <Icon name="Plus" size={15} />Создать
                      </button>
                    </div>
                    {orders.length === 0 ? (
                      <div className="bg-white rounded-lg border border-border p-8 text-center">
                        <Icon name="FileText" size={32} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground font-ibm text-sm">Приказов пока нет.</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm font-ibm">
                          <thead>
                            <tr className="bg-navy/5 border-b border-border">
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Номер</th>
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Наименование</th>
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide hidden sm:table-cell">Статус</th>
                              <th className="text-left px-4 py-3 font-oswald text-navy text-xs tracking-wide">Действия</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {orders.map(order => (
                              <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                                <td className="px-4 py-3 font-oswald text-navy font-semibold">{order.order_num}</td>
                                <td className="px-4 py-3 text-foreground">
                                  <div className="flex items-center gap-2">
                                    {order.priority === "high" && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Срочный</span>}
                                    {order.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">{order.date}</div>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                  <span className={`text-xs px-2 py-1 rounded ${order.status === "Действующий" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{order.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button onClick={() => { setEditOrder(order); setOrderForm({ date: order.date, title: order.title, status: order.status, priority: order.priority }); setOrderFormOpen(true); }} className="text-muted-foreground hover:text-navy transition-colors" title="Редактировать"><Icon name="Pencil" size={14} /></button>
                                    <button onClick={() => setDeleteOrderConfirm(order)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Удалить"><Icon name="Trash2" size={14} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: REPRIMANDS */}
                {mgmtTab === "reprimands" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-oswald text-navy text-sm tracking-wide">Взысканий: {reprimands.length}</span>
                      <button onClick={() => { setRepForm({ emp_id: 0, type: "Выговор", reason: "", issued_by: "" }); setRepFormOpen(true); }} disabled={employees.length === 0} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald font-medium px-4 py-2 text-sm tracking-wide transition-colors rounded">
                        <Icon name="AlertTriangle" size={15} />Выдать взыскание
                      </button>
                    </div>
                    {employees.length === 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm font-ibm text-orange-700">Сначала добавьте сотрудников во вкладке «Сотрудники».</div>
                    )}
                    {reprimands.length === 0 ? (
                      <div className="bg-white rounded-lg border border-border p-8 text-center">
                        <Icon name="CheckCircle" size={32} className="mx-auto text-green-400 mb-2" />
                        <p className="text-muted-foreground font-ibm text-sm">Взысканий нет. Личный состав ведёт себя примерно.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {reprimands.map(r => (
                          <div key={r.id} className="bg-white rounded-lg border border-orange-200 p-4 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <Icon name="AlertTriangle" size={16} className="text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-oswald text-navy font-semibold text-sm">{getEmpName(r.emp_id)}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded font-ibm ${r.type === "Выговор" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{r.type}</span>
                                <span className="text-xs text-muted-foreground font-ibm">{r.date}</span>
                              </div>
                              <p className="text-sm font-ibm text-foreground mt-1">{r.reason}</p>
                              {r.issued_by && <p className="text-xs text-muted-foreground font-ibm mt-0.5">Выдал: {r.issued_by}</p>}
                            </div>
                            <button onClick={() => setDeleteRepConfirm(r)} className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0" title="Снять взыскание"><Icon name="Trash2" size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* REPRIMAND FORM */}
                {repFormOpen && (
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setRepFormOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                      <div className="bg-orange-500 px-5 py-4 flex items-center justify-between">
                        <span className="font-oswald text-white tracking-wide flex items-center gap-2">
                          <Icon name="AlertTriangle" size={16} />Выдать взыскание
                        </span>
                        <button onClick={() => setRepFormOpen(false)} className="text-white/70 hover:text-white"><Icon name="X" size={18} /></button>
                      </div>
                      <div className="p-5 space-y-3">
                        <div>
                          <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Сотрудник *</label>
                          <select value={repForm.emp_id} onChange={e => setRepForm(p => ({ ...p, emp_id: Number(e.target.value) }))} className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all bg-white">
                            <option value={0}>— Выбрать —</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.rank})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Тип взыскания</label>
                          <div className="flex gap-2">
                            {["Выговор", "Устный выговор", "Строгий выговор"].map(t => (
                              <button key={t} onClick={() => setRepForm(p => ({ ...p, type: t }))} className={`flex-1 py-2 rounded text-xs font-oswald tracking-wide border transition-colors ${repForm.type === t ? "bg-orange-500 text-white border-orange-500" : "border-border text-muted-foreground hover:border-orange-300"}`}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Основание *</label>
                          <textarea value={repForm.reason} onChange={e => setRepForm(p => ({ ...p, reason: e.target.value }))} placeholder="Нарушение служебной дисциплины..." rows={3} className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all resize-none" />
                        </div>
                        <div>
                          <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Выдал (ваш ник)</label>
                          <input value={repForm.issued_by} onChange={e => setRepForm(p => ({ ...p, issued_by: e.target.value }))} placeholder="Ethan_Santoro" className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all" />
                        </div>
                        <button disabled={!repForm.emp_id || !repForm.reason.trim()} onClick={saveReprimand} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald font-semibold py-3 tracking-wide transition-colors rounded mt-1">
                          Выдать взыскание
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DELETE REP CONFIRM */}
                {deleteRepConfirm && (
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setDeleteRepConfirm(null)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-slide-up p-6" onClick={e => e.stopPropagation()}>
                      <h3 className="font-oswald text-navy text-lg mb-2">Снять взыскание?</h3>
                      <p className="text-muted-foreground text-sm font-ibm mb-5">Взыскание «{deleteRepConfirm.type}» для {getEmpName(deleteRepConfirm.emp_id)} будет удалено.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setDeleteRepConfirm(null)} className="flex-1 border border-border rounded py-2.5 text-sm font-oswald text-muted-foreground hover:text-navy transition-colors">Отмена</button>
                        <button onClick={async () => { await api.reprimands.remove(deleteRepConfirm.id); setReprimands(p => p.filter(r => r.id !== deleteRepConfirm.id)); setDeleteRepConfirm(null); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2.5 text-sm font-oswald transition-colors">Снять</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* DOCUMENTS */}
        {section === "documents" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="font-oswald text-2xl text-navy font-semibold">Документы</h2>
              <p className="text-muted-foreground text-sm font-ibm">Нормативные акты, бланки и инструкции</p>
            </div>
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              {mockDocuments.map((doc, i) => (
                <div key={doc.id} className={`flex items-center gap-4 px-4 py-4 hover:bg-muted/40 transition-colors ${i < mockDocuments.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="FileText" size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-ibm font-medium text-foreground text-sm truncate">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground font-ibm">{doc.type}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground font-ibm">{doc.date}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground font-ibm">{doc.size}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-navy hover:text-navy-light font-oswald tracking-wide transition-colors flex-shrink-0">
                    <Icon name="Download" size={14} />
                    <span className="hidden sm:block">Скачать</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACTS */}
        {section === "contacts" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="font-oswald text-2xl text-navy font-semibold">Контакты</h2>
              <p className="text-muted-foreground text-sm font-ibm">Связь с руководством и подразделениями ГУВД</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "Shield", title: "Дежурная часть", desc: "Сообщить об инциденте или запросить поддержку", contact: "/гувд в игровом чате", badge: "24/7" },
                { icon: "Users", title: "Отдел кадров", desc: "Вопросы по приёму на службу, документам, рапортам", contact: "RP-анкета на форуме", badge: null },
                { icon: "Star", title: "Командование", desc: "Обращения к руководящему составу ГУВД", contact: "Личное сообщение в Discord", badge: null },
                { icon: "MessageSquare", title: "Discord сервера", desc: "Официальный сервер МТА Провинция", contact: "discord.gg/provincemta", badge: "Online" },
              ].map((c) => (
                <div key={c.title} className="bg-white rounded-lg border border-border p-5 card-hover">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={c.icon} size={20} className="text-navy" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-oswald text-navy font-semibold text-sm">{c.title}</h3>
                        {c.badge && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-ibm">{c.badge}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground font-ibm mt-1 leading-relaxed">{c.desc}</p>
                      <div className="mt-2 text-xs font-oswald text-navy/70 tracking-wide">{c.contact}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CABINET */}
        {section === "cabinet" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-oswald text-2xl text-navy font-semibold">Личный кабинет</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 bg-white rounded-lg border border-border p-5 text-center">
                <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center mx-auto border-4 border-navy/20 mb-3">
                  <Icon name="User" size={36} className="text-navy" />
                </div>
                <h3 className="font-oswald text-navy font-semibold text-lg">
                  {role === "commander" ? "Руководящий состав" : "Сотрудник ГУВД"}
                </h3>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-ibm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />На службе
                </div>
                {role === "commander" && (
                  <div className="mt-2 block text-xs bg-yellow-100 text-amber-800 px-3 py-1.5 rounded-full font-oswald tracking-wide">★ Командование</div>
                )}
              </div>
              <div className="sm:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-navy/5 border-b border-border px-4 py-3">
                    <span className="font-oswald text-navy text-sm tracking-wide">Информация</span>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { label: "Уровень доступа", value: role === "commander" ? "Руководящий состав" : "Рядовой состав" },
                      { label: "Сотрудников в системе", value: String(employees.length) },
                      { label: "Приказов", value: String(orders.length) },
                      { label: "Взысканий", value: String(reprimands.length) },
                    ].map((row) => (
                      <div key={row.label} className="flex px-4 py-3">
                        <span className="text-xs text-muted-foreground font-ibm w-44 flex-shrink-0">{row.label}</span>
                        <span className="text-sm font-ibm text-foreground font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {role === "commander" && (
                  <div className="bg-white rounded-lg border border-border overflow-hidden">
                    <div className="bg-navy/5 border-b border-border px-4 py-3">
                      <span className="font-oswald text-navy text-sm tracking-wide">Быстрые действия</span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      <button onClick={() => { setMgmtTab("employees"); setSection("management"); }} className="flex items-center gap-2 bg-navy/10 hover:bg-navy/20 text-navy text-xs font-oswald tracking-wide px-3 py-2 rounded transition-colors">
                        <Icon name="UserPlus" size={13} />Принять сотрудника
                      </button>
                      <button onClick={() => { setEditOrder(null); setOrderForm(emptyOrder); setOrderFormOpen(true); setSection("orders"); }} className="flex items-center gap-2 bg-navy/10 hover:bg-navy/20 text-navy text-xs font-oswald tracking-wide px-3 py-2 rounded transition-colors">
                        <Icon name="Plus" size={13} />Создать приказ
                      </button>
                      <button onClick={() => { setMgmtTab("reprimands"); setSection("management"); }} className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-oswald tracking-wide px-3 py-2 rounded transition-colors">
                        <Icon name="AlertTriangle" size={13} />Выдать взыскание
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-navy mt-auto py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs font-ibm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span>© 2026 ГУВД Провинции · MTA Server 1</span>
            <span className="hidden sm:block text-white/20">·</span>
            <span className="flex items-center gap-1.5">
              Разработчик:&nbsp;
              <a href="https://vk.com/id1089780734" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-gold transition-colors underline-offset-2 hover:underline">Ethan_Santoro</a>
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <Icon name="Shield" size={12} />Официальный внутренний портал
          </span>
        </div>
      </footer>

      {/* Login Modal */}
      {loginOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setLoginOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-navy px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={CREST_URL} alt="Герб" className="w-8 h-8 rounded-full border border-gold object-cover" />
                <span className="font-oswald text-white tracking-wide">Вход в систему</span>
              </div>
              <button onClick={() => setLoginOpen(false)} className="text-white/60 hover:text-white transition-colors"><Icon name="X" size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-oswald text-navy tracking-wide uppercase block mb-2">Уровень доступа</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setLoginRole("employee")} className={`py-3 rounded text-sm font-oswald tracking-wide transition-colors ${loginRole === "employee" ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>Сотрудник</button>
                  <button onClick={() => setLoginRole("commander")} className={`py-3 rounded text-sm font-oswald tracking-wide transition-colors ${loginRole === "commander" ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>Руководство</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-oswald text-navy tracking-wide uppercase block mb-2">Ник в игре</label>
                <input type="text" placeholder="Ваш игровой ник..." className="w-full border border-border rounded px-3 py-2.5 text-sm font-ibm outline-none focus:border-navy/50 focus:ring-1 focus:ring-navy/20 transition-all" />
              </div>
              <div>
                <label className="text-xs font-oswald text-navy tracking-wide uppercase block mb-2">Пароль</label>
                <input type="password" placeholder="••••••••" className="w-full border border-border rounded px-3 py-2.5 text-sm font-ibm outline-none focus:border-navy/50 focus:ring-1 focus:ring-navy/20 transition-all" />
              </div>
              <button onClick={handleLogin} className="w-full bg-navy hover:bg-navy-light text-white font-oswald font-semibold py-3 tracking-wide transition-colors rounded mt-2">Войти в портал</button>
              <p className="text-[11px] text-muted-foreground font-ibm text-center leading-relaxed">
                Доступ только для действующих сотрудников ГУВД.<br />При проблемах — обратитесь к командованию.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}