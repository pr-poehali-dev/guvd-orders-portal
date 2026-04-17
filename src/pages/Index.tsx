import { useState } from "react";
import Icon from "@/components/ui/icon";

type Role = "guest" | "employee" | "commander";
type Section = "home" | "orders" | "employees" | "management" | "documents" | "contacts" | "cabinet";

const CREST_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Emblem_of_the_Ministry_of_Internal_Affairs.svg/960px-Emblem_of_the_Ministry_of_Internal_Affairs.svg.png";

const mockOrders = [
  { id: "№ 147", date: "15.04.2026", title: "О проведении плановых учений личного состава", status: "Действующий", priority: "high" },
  { id: "№ 146", date: "12.04.2026", title: "О назначении дежурной смены на апрель 2026", status: "Действующий", priority: "normal" },
  { id: "№ 145", date: "08.04.2026", title: "О поощрении сотрудников отдела патрулирования", status: "Действующий", priority: "normal" },
  { id: "№ 144", date: "01.04.2026", title: "О введении новых стандартов служебной формы", status: "Архив", priority: "normal" },
  { id: "№ 143", date: "25.03.2026", title: "О реорганизации дорожно-патрульной службы", status: "Архив", priority: "normal" },
];

const mockEmployees = [
  { id: 1, rank: "Полковник", name: "Александр Кравченко", dept: "Командование", badge: "ГУ-001", status: "online" },
  { id: 2, rank: "Подполковник", name: "Дмитрий Воронов", dept: "Оперативный отдел", badge: "ГУ-008", status: "online" },
  { id: 3, rank: "Майор", name: "Сергей Лисицын", dept: "Патрульная служба", badge: "ГУ-015", status: "offline" },
  { id: 4, rank: "Капитан", name: "Иван Морозов", dept: "Следственный отдел", badge: "ГУ-022", status: "online" },
  { id: 5, rank: "Старший лейтенант", name: "Николай Петров", dept: "Патрульная служба", badge: "ГУ-031", status: "offline" },
  { id: 6, rank: "Лейтенант", name: "Андрей Зайцев", dept: "ДПС", badge: "ГУ-044", status: "online" },
];

const mockDocuments = [
  { id: 1, title: "Устав ГУВД Провинции", type: "Нормативный акт", date: "01.01.2026", size: "124 КБ" },
  { id: 2, title: "Регламент несения службы", type: "Инструкция", date: "10.02.2026", size: "87 КБ" },
  { id: 3, title: "Форма рапорта об инциденте", type: "Бланк", date: "15.03.2026", size: "32 КБ" },
  { id: 4, title: "Кодекс поведения сотрудника", type: "Нормативный акт", date: "01.01.2026", size: "56 КБ" },
  { id: 5, title: "Схема патрульных маршрутов", type: "Карта", date: "20.03.2026", size: "210 КБ" },
];

const stats = [
  { label: "Сотрудников", value: "47", icon: "Users" },
  { label: "Активных приказов", value: "12", icon: "FileText" },
  { label: "Дел в производстве", value: "23", icon: "Briefcase" },
  { label: "Патрулей сегодня", value: "8", icon: "Shield" },
];

export default function Index() {
  const [role, setRole] = useState<Role>("guest");
  const [section, setSection] = useState<Section>("home");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<"employee" | "commander">("employee");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: Section; label: string; icon: string; restricted?: boolean }[] = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "orders", label: "Приказы", icon: "FileText", restricted: true },
    { id: "employees", label: "Сотрудники", icon: "Users", restricted: true },
    { id: "management", label: "Управление", icon: "Settings", restricted: true },
    { id: "documents", label: "Документы", icon: "FolderOpen", restricted: true },
    { id: "contacts", label: "Контакты", icon: "Phone" },
    { id: "cabinet", label: "Кабинет", icon: "UserCircle", restricted: true },
  ];

  const handleNav = (id: Section, restricted?: boolean) => {
    if (restricted && role === "guest") {
      setLoginOpen(true);
      return;
    }
    setSection(id);
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setRole(loginRole);
    setLoginOpen(false);
    setSection("cabinet");
  };

  const handleLogout = () => {
    setRole("guest");
    setSection("home");
  };

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
          <img
            src={CREST_URL}
            alt="Герб ГУВД"
            className="w-14 h-14 rounded-full border-2 border-gold object-cover flex-shrink-0 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-oswald text-white text-xl sm:text-2xl font-semibold tracking-wide leading-tight">
              ГУВД · Провинция
            </h1>
            <p className="text-white/60 text-xs font-ibm tracking-wider uppercase mt-0.5">
              Главное Управление Внутренних Дел · MTA Server 1
            </p>
          </div>
          <div className="flex items-center gap-3">
            {role === "guest" ? (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 bg-gold hover:bg-yellow-400 text-navy font-oswald font-semibold px-4 py-2 text-sm tracking-wide transition-colors rounded"
              >
                <Icon name="LogIn" size={15} />
                Войти
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-white text-sm font-oswald">
                    {role === "commander" ? "Руководящий состав" : "Сотрудник"}
                  </span>
                  <span className="text-gold-light text-xs font-ibm">
                    {role === "commander" ? "★ Командование" : "● На службе"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/60 hover:text-white transition-colors p-1.5"
                  title="Выйти"
                >
                  <Icon name="LogOut" size={18} />
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden text-white/80 hover:text-white p-1"
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`bg-navy border-t border-white/10 ${mobileMenuOpen ? "block" : "hidden sm:block"}`}>
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex flex-col sm:flex-row">
              {navItems.map((item) => {
                const isActive = section === item.id;
                const locked = item.restricted && role === "guest";
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNav(item.id, item.restricted)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-oswald tracking-wide w-full sm:w-auto transition-colors
                        ${isActive
                          ? "text-gold border-b-2 border-gold bg-white/5"
                          : locked
                          ? "text-white/40 hover:text-white/60"
                          : "text-white/75 hover:text-white hover:bg-white/5"
                        }`}
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

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">

        {/* HOME */}
        {section === "home" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-navy-mid rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 header-pattern opacity-50" />
              <div className="relative px-6 py-10 sm:py-14 flex flex-col sm:flex-row items-center gap-6">
                <img src={CREST_URL} alt="Герб" className="w-24 h-24 rounded-full border-4 border-gold object-cover shadow-xl flex-shrink-0" />
                <div>
                  <div className="text-gold text-xs font-oswald tracking-widest uppercase mb-2">Официальный портал</div>
                  <h2 className="font-oswald text-white text-3xl sm:text-4xl font-bold leading-tight">
                    ГУВД Провинции
                  </h2>
                  <p className="text-white/60 font-ibm text-sm mt-2 max-w-xl leading-relaxed">
                    Внутренний информационный портал Главного Управления Внутренних Дел игрового сервера МТА Провинция (Сервер 1). Доступ к приказам, документам и личному кабинету требует авторизации.
                  </p>
                  {role === "guest" && (
                    <button
                      onClick={() => setLoginOpen(true)}
                      className="mt-4 bg-gold hover:bg-yellow-400 text-navy font-oswald font-semibold px-6 py-2.5 text-sm tracking-wide transition-colors rounded inline-flex items-center gap-2"
                    >
                      <Icon name="LogIn" size={16} />
                      Войти в систему
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
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
                  {mockOrders.slice(0, 3).map((o) => (
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
                  {mockEmployees.filter(e => e.status === "online").map((emp) => (
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
                <button className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-oswald font-medium px-4 py-2 text-sm tracking-wide transition-colors rounded">
                  <Icon name="Plus" size={16} />
                  Создать приказ
                </button>
              )}
            </div>
            <div className="bg-white rounded-lg border border-border px-4 py-3 flex flex-wrap gap-2">
              {["Все", "Действующие", "Архив", "Срочные"].map((f) => (
                <button key={f} className={`px-3 py-1.5 text-xs font-oswald tracking-wide rounded transition-colors ${f === "Все" ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10 hover:text-navy"}`}>{f}</button>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-border overflow-hidden">
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
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-navy font-oswald">{order.id}</td>
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
                            <button className="text-muted-foreground hover:text-navy transition-colors"><Icon name="Pencil" size={15} /></button>
                            <button className="text-muted-foreground hover:text-red-500 transition-colors"><Icon name="Trash2" size={15} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMPLOYEES */}
        {section === "employees" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-oswald text-2xl text-navy font-semibold">Личный состав</h2>
                <p className="text-muted-foreground text-sm font-ibm">Реестр сотрудников ГУВД Провинции</p>
              </div>
              {role === "commander" && (
                <button className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-oswald font-medium px-4 py-2 text-sm tracking-wide transition-colors rounded">
                  <Icon name="UserPlus" size={16} />
                  Принять сотрудника
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockEmployees.map((emp, i) => (
                <div key={emp.id} className={`bg-white rounded-lg border border-border p-4 card-hover animate-slide-up animate-stagger-${Math.min(i + 1, 6)}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 border-2 border-navy/20">
                      <Icon name="User" size={22} className="text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-oswald text-navy font-semibold text-sm truncate">{emp.name}</h3>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${emp.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
                      </div>
                      <div className="text-xs text-muted-foreground font-ibm">{emp.rank}</div>
                      <div className="text-xs text-muted-foreground font-ibm mt-0.5">{emp.dept}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-oswald text-navy/60 tracking-wide">Жетон: {emp.badge}</span>
                    {role === "commander" && (
                      <div className="flex gap-2">
                        <button className="text-muted-foreground hover:text-navy transition-colors"><Icon name="Pencil" size={14} /></button>
                        <button className="text-muted-foreground hover:text-red-500 transition-colors"><Icon name="UserMinus" size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MANAGEMENT */}
        {section === "management" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="font-oswald text-2xl text-navy font-semibold">Управление</h2>
              <p className="text-muted-foreground text-sm font-ibm">Инструменты для руководящего состава</p>
            </div>
            {role !== "commander" ? (
              <div className="bg-white rounded-lg border border-border p-8 text-center">
                <Icon name="ShieldOff" size={40} className="mx-auto text-muted-foreground mb-3" />
                <h3 className="font-oswald text-navy text-lg mb-2">Доступ ограничен</h3>
                <p className="text-muted-foreground text-sm font-ibm">Этот раздел доступен только руководящему составу ГУВД</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: "FileText", title: "Создать приказ", desc: "Новый приказ по личному составу или общий", color: "bg-blue-50 text-blue-700" },
                    { icon: "Users", title: "Личный состав", desc: "Принять, уволить, повысить сотрудника", color: "bg-green-50 text-green-700" },
                    { icon: "BarChart3", title: "Отчёты", desc: "Аналитика активности и статистика", color: "bg-purple-50 text-purple-700" },
                    { icon: "Bell", title: "Оповещения", desc: "Рассылка уведомлений личному составу", color: "bg-orange-50 text-orange-700" },
                    { icon: "Award", title: "Поощрения", desc: "Награждение и взыскания сотрудников", color: "bg-yellow-50 text-yellow-700" },
                    { icon: "Calendar", title: "Расписание", desc: "График дежурств и патрулей", color: "bg-teal-50 text-teal-700" },
                  ].map((item) => (
                    <button key={item.title} className="bg-white rounded-lg border border-border p-5 text-left card-hover group transition-all hover:border-navy/30">
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                        <Icon name={item.icon} size={20} />
                      </div>
                      <h3 className="font-oswald text-navy font-semibold text-sm mb-1 group-hover:text-navy-light transition-colors">{item.title}</h3>
                      <p className="text-xs text-muted-foreground font-ibm leading-relaxed">{item.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-navy/5 border-b border-border px-4 py-3">
                    <span className="font-oswald text-navy text-sm tracking-wide">Статистика за апрель 2026</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Выдано приказов", value: "7" },
                      { label: "Поощрений", value: "3" },
                      { label: "Взысканий", value: "1" },
                      { label: "Рапортов", value: "18" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="font-oswald text-2xl text-navy font-bold">{s.value}</div>
                        <div className="text-xs text-muted-foreground font-ibm mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  {role === "commander" ? "Александр Кравченко" : "Сотрудник ГУВД"}
                </h3>
                <div className="text-xs text-muted-foreground font-ibm mt-1">
                  {role === "commander" ? "Полковник · Командование" : "Лейтенант · Патрульная служба"}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-ibm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  На службе
                </div>
                {role === "commander" && (
                  <div className="mt-2 block text-xs bg-yellow-100 text-amber-800 px-3 py-1.5 rounded-full font-oswald tracking-wide">
                    ★ Руководящий состав
                  </div>
                )}
              </div>
              <div className="sm:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-navy/5 border-b border-border px-4 py-3">
                    <span className="font-oswald text-navy text-sm tracking-wide">Данные сотрудника</span>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { label: "Жетон", value: role === "commander" ? "ГУ-001" : "ГУ-044" },
                      { label: "Звание", value: role === "commander" ? "Полковник" : "Лейтенант" },
                      { label: "Отдел", value: role === "commander" ? "Командование" : "Патрульная служба" },
                      { label: "Дата зачисления", value: "01.03.2026" },
                      { label: "Уровень доступа", value: role === "commander" ? "Руководящий состав" : "Рядовой состав" },
                    ].map((row) => (
                      <div key={row.label} className="flex px-4 py-3">
                        <span className="text-xs text-muted-foreground font-ibm w-36 flex-shrink-0">{row.label}</span>
                        <span className="text-sm font-ibm text-foreground font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-navy/5 border-b border-border px-4 py-3">
                    <span className="font-oswald text-navy text-sm tracking-wide">Мои задачи</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { task: "Ознакомиться с приказом №147", done: false },
                      { task: "Сдать рапорт за дежурство 15.04", done: true },
                      { task: "Пройти плановый инструктаж", done: false },
                    ].map((t) => (
                      <div key={t.task} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done ? "bg-navy border-navy" : "border-muted-foreground"}`}>
                          {t.done && <Icon name="Check" size={10} className="text-white" />}
                        </div>
                        <span className={`text-sm font-ibm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-navy mt-auto py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-white/40 text-xs font-ibm">
          <span>© 2026 ГУВД Провинции · MTA Server 1</span>
          <span className="flex items-center gap-1.5">
            <Icon name="Shield" size={12} />
            Официальный внутренний портал
          </span>
        </div>
      </footer>

      {/* Login Modal */}
      {loginOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setLoginOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-navy px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={CREST_URL} alt="Герб" className="w-8 h-8 rounded-full border border-gold object-cover" />
                <span className="font-oswald text-white tracking-wide">Вход в систему</span>
              </div>
              <button onClick={() => setLoginOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <Icon name="X" size={18} />
              </button>
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
              <button onClick={handleLogin} className="w-full bg-navy hover:bg-navy-light text-white font-oswald font-semibold py-3 tracking-wide transition-colors rounded mt-2">
                Войти в портал
              </button>
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