import { useState } from "react";
import Icon from "@/components/ui/icon";

type WantedTab = "persons" | "vehicles";

interface WantedPerson {
  id: number;
  nick: string;
  reason: string;
  article: string;
  addedBy: string;
  date: string;
  photo: string;
  status: "active" | "detained";
}

interface WantedVehicle {
  id: number;
  plate: string;
  brand: string;
  color: string;
  owner: string;
  reason: string;
  addedBy: string;
  date: string;
  status: "active" | "found";
}

const initialPersons: WantedPerson[] = [
  {
    id: 1,
    nick: "Vladimir_Plehanov",
    reason: "Уклонение от ареста, нападение на сотрудника полиции",
    article: "ст. 318 УК РФ",
    addedBy: "Ethan_Santoro",
    date: "15.04.2026",
    photo: "",
    status: "active",
  },
  {
    id: 2,
    nick: "Marcus_Reed",
    reason: "Вооружённый грабёж, незаконное хранение оружия",
    article: "ст. 162 УК РФ",
    addedBy: "Ethan_Santoro",
    date: "12.04.2026",
    photo: "",
    status: "active",
  },
];

const initialVehicles: WantedVehicle[] = [
  {
    id: 1,
    plate: "А123ВС77",
    brand: "Elegy Retro Custom",
    color: "Чёрный",
    owner: "Vladimir_Plehanov",
    reason: "Использовалось при совершении преступления",
    addedBy: "Ethan_Santoro",
    date: "15.04.2026",
    status: "active",
  },
];

const emptyPerson = { nick: "", reason: "", article: "", addedBy: "", photo: "" };
const emptyVehicle = { plate: "", brand: "", color: "", owner: "", reason: "", addedBy: "" };

interface Props {
  canEdit: boolean;
}

export default function WantedList({ canEdit }: Props) {
  const [tab, setTab] = useState<WantedTab>("persons");
  const [persons, setPersons] = useState<WantedPerson[]>(initialPersons);
  const [vehicles, setVehicles] = useState<WantedVehicle[]>(initialVehicles);

  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [personForm, setPersonForm] = useState(emptyPerson);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);

  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "person" | "vehicle"; id: number } | null>(null);

  const today = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  };

  const addPerson = () => {
    if (!personForm.nick.trim()) return;
    setPersons((prev) => [
      { ...personForm, id: Date.now(), date: today(), status: "active" },
      ...prev,
    ]);
    setPersonForm(emptyPerson);
    setShowPersonForm(false);
  };

  const addVehicle = () => {
    if (!vehicleForm.plate.trim()) return;
    setVehicles((prev) => [
      { ...vehicleForm, id: Date.now(), date: today(), status: "active" },
      ...prev,
    ]);
    setVehicleForm(emptyVehicle);
    setShowVehicleForm(false);
  };

  const togglePersonStatus = (id: number) => {
    setPersons((prev) =>
      prev.map((p) => p.id === id ? { ...p, status: p.status === "active" ? "detained" : "active" } : p)
    );
  };

  const toggleVehicleStatus = (id: number) => {
    setVehicles((prev) =>
      prev.map((v) => v.id === id ? { ...v, status: v.status === "active" ? "found" : "active" } : v)
    );
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "person") setPersons((p) => p.filter((x) => x.id !== deleteConfirm.id));
    else setVehicles((v) => v.filter((x) => x.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  const filteredPersons = persons.filter(
    (p) =>
      p.nick.toLowerCase().includes(search.toLowerCase()) ||
      p.reason.toLowerCase().includes(search.toLowerCase()) ||
      p.article.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.owner.toLowerCase().includes(search.toLowerCase())
  );

  const activePersons = persons.filter((p) => p.status === "active").length;
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-oswald text-2xl text-navy font-semibold flex items-center gap-2">
            <Icon name="AlertOctagon" size={22} className="text-red-600" />
            База розыска
          </h2>
          <p className="text-muted-foreground text-sm font-ibm mt-0.5">
            Лица и транспортные средства, находящиеся в розыске ГУВД Провинции
          </p>
        </div>
        {/* Counters */}
        <div className="flex gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
            <div className="font-oswald text-2xl text-red-700 font-bold">{activePersons}</div>
            <div className="text-[11px] text-red-500 font-ibm">Лиц в розыске</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-center">
            <div className="font-oswald text-2xl text-orange-700 font-bold">{activeVehicles}</div>
            <div className="text-[11px] text-orange-500 font-ibm">Авто в розыске</div>
          </div>
        </div>
      </div>

      {/* Tabs + search + add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-lg border border-border overflow-hidden bg-white">
          <button
            onClick={() => setTab("persons")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-oswald tracking-wide transition-colors ${tab === "persons" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"}`}
          >
            <Icon name="User" size={15} />
            Лица
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-ibm ${tab === "persons" ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
              {activePersons}
            </span>
          </button>
          <button
            onClick={() => setTab("vehicles")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-oswald tracking-wide transition-colors border-l border-border ${tab === "vehicles" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"}`}
          >
            <Icon name="Car" size={15} />
            Транспорт
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-ibm ${tab === "vehicles" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
              {activeVehicles}
            </span>
          </button>
        </div>

        <div className="flex-1 relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "persons" ? "Поиск по нику, причине, статье..." : "Поиск по номеру, марке, владельцу..."}
            className="w-full border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all bg-white"
          />
        </div>

        {canEdit && (
          <button
            onClick={() => tab === "persons" ? setShowPersonForm(true) : setShowVehicleForm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-oswald font-medium px-4 py-2.5 text-sm tracking-wide transition-colors rounded-lg flex-shrink-0"
          >
            <Icon name="Plus" size={16} />
            {tab === "persons" ? "Объявить розыск" : "Добавить авто"}
          </button>
        )}
      </div>

      {/* PERSONS */}
      {tab === "persons" && (
        <div className="space-y-3">
          {filteredPersons.length === 0 && (
            <div className="bg-white rounded-lg border border-border p-10 text-center">
              <Icon name="UserCheck" size={36} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-ibm text-sm">Лиц в розыске не найдено</p>
            </div>
          )}
          {filteredPersons.map((person) => (
            <div key={person.id} className={`bg-white rounded-lg border overflow-hidden transition-all ${person.status === "detained" ? "border-green-200 opacity-70" : "border-red-200"}`}>
              <div className={`px-4 py-2 flex items-center justify-between ${person.status === "active" ? "bg-red-600" : "bg-green-600"}`}>
                <div className="flex items-center gap-2">
                  <Icon name={person.status === "active" ? "AlertTriangle" : "CheckCircle"} size={14} className="text-white" />
                  <span className="font-oswald text-white text-xs tracking-wide">
                    {person.status === "active" ? "В РОЗЫСКЕ" : "ЗАДЕРЖАН"}
                  </span>
                </div>
                <span className="text-white/70 text-xs font-ibm">{person.date}</span>
              </div>

              <div className="p-4 flex gap-4">
                {/* Photo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {person.photo ? (
                    <img src={person.photo} alt={person.nick} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="User" size={28} className="text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3 className="font-oswald text-navy text-lg font-semibold">{person.nick}</h3>
                      <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-ibm mt-0.5">{person.article}</span>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => togglePersonStatus(person.id)}
                          title={person.status === "active" ? "Отметить задержанным" : "Вернуть в розыск"}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-oswald tracking-wide transition-colors ${person.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                        >
                          <Icon name={person.status === "active" ? "UserCheck" : "UserX"} size={13} />
                          {person.status === "active" ? "Задержан" : "В розыск"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: "person", id: person.id })}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1.5"
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2">
                      <span className="text-[11px] text-muted-foreground font-ibm w-20 flex-shrink-0">Причина:</span>
                      <span className="text-sm font-ibm text-foreground">{person.reason}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] text-muted-foreground font-ibm w-20 flex-shrink-0">Объявил:</span>
                      <span className="text-sm font-ibm text-navy font-medium">{person.addedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VEHICLES */}
      {tab === "vehicles" && (
        <div className="space-y-3">
          {filteredVehicles.length === 0 && (
            <div className="bg-white rounded-lg border border-border p-10 text-center">
              <Icon name="Car" size={36} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-ibm text-sm">Транспорт в розыске не найден</p>
            </div>
          )}
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className={`bg-white rounded-lg border overflow-hidden ${vehicle.status === "found" ? "border-green-200 opacity-70" : "border-orange-200"}`}>
              <div className={`px-4 py-2 flex items-center justify-between ${vehicle.status === "active" ? "bg-orange-500" : "bg-green-600"}`}>
                <div className="flex items-center gap-2">
                  <Icon name={vehicle.status === "active" ? "AlertTriangle" : "CheckCircle"} size={14} className="text-white" />
                  <span className="font-oswald text-white text-xs tracking-wide">
                    {vehicle.status === "active" ? "В РОЗЫСКЕ" : "НАЙДЕНО"}
                  </span>
                </div>
                <span className="text-white/70 text-xs font-ibm">{vehicle.date}</span>
              </div>

              <div className="p-4 flex gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="Car" size={28} className="text-orange-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3 className="font-oswald text-navy text-lg font-semibold">{vehicle.plate}</h3>
                      <span className="text-sm text-muted-foreground font-ibm">{vehicle.brand} · {vehicle.color}</span>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleVehicleStatus(vehicle.id)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-oswald tracking-wide transition-colors ${vehicle.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
                        >
                          <Icon name={vehicle.status === "active" ? "CheckCircle" : "AlertTriangle"} size={13} />
                          {vehicle.status === "active" ? "Найдено" : "В розыск"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: "vehicle", id: vehicle.id })}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1.5"
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2">
                      <span className="text-[11px] text-muted-foreground font-ibm w-20 flex-shrink-0">Владелец:</span>
                      <span className="text-sm font-ibm text-foreground">{vehicle.owner}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] text-muted-foreground font-ibm w-20 flex-shrink-0">Причина:</span>
                      <span className="text-sm font-ibm text-foreground">{vehicle.reason}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] text-muted-foreground font-ibm w-20 flex-shrink-0">Объявил:</span>
                      <span className="text-sm font-ibm text-navy font-medium">{vehicle.addedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD PERSON MODAL */}
      {showPersonForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowPersonForm(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-red-600 px-5 py-4 flex items-center justify-between">
              <span className="font-oswald text-white tracking-wide flex items-center gap-2">
                <Icon name="AlertOctagon" size={16} />
                Объявить в розыск
              </span>
              <button onClick={() => setShowPersonForm(false)} className="text-white/70 hover:text-white"><Icon name="X" size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Ник *", key: "nick", placeholder: "Ethan_Santoro" },
                { label: "Причина", key: "reason", placeholder: "Уклонение от ареста" },
                { label: "Статья", key: "article", placeholder: "ст. 318 УК РФ" },
                { label: "Объявил (ваш ник)", key: "addedBy", placeholder: "Ethan_Santoro" },
                { label: "Фото (ссылка)", key: "photo", placeholder: "https://..." },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">{f.label}</label>
                  <input
                    value={(personForm as Record<string, string>)[f.key]}
                    onChange={(e) => setPersonForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all"
                  />
                </div>
              ))}
              <button
                onClick={addPerson}
                disabled={!personForm.nick.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald font-semibold py-3 tracking-wide transition-colors rounded mt-1"
              >
                Объявить в розыск
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showVehicleForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowVehicleForm(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-orange-500 px-5 py-4 flex items-center justify-between">
              <span className="font-oswald text-white tracking-wide flex items-center gap-2">
                <Icon name="Car" size={16} />
                Добавить авто в розыск
              </span>
              <button onClick={() => setShowVehicleForm(false)} className="text-white/70 hover:text-white"><Icon name="X" size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Госномер *", key: "plate", placeholder: "А123ВС77" },
                { label: "Марка / модель", key: "brand", placeholder: "Elegy Retro Custom" },
                { label: "Цвет", key: "color", placeholder: "Чёрный" },
                { label: "Владелец (ник)", key: "owner", placeholder: "Ethan_Santoro" },
                { label: "Причина", key: "reason", placeholder: "Использовалось при совершении преступления" },
                { label: "Объявил (ваш ник)", key: "addedBy", placeholder: "Ethan_Santoro" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">{f.label}</label>
                  <input
                    value={(vehicleForm as Record<string, string>)[f.key]}
                    onChange={(e) => setVehicleForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all"
                  />
                </div>
              ))}
              <button
                onClick={addVehicle}
                disabled={!vehicleForm.plate.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald font-semibold py-3 tracking-wide transition-colors rounded mt-1"
              >
                Добавить в розыск
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-slide-up p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-oswald text-navy text-lg mb-2">Подтвердите удаление</h3>
            <p className="text-muted-foreground text-sm font-ibm mb-5">Запись будет удалена из базы розыска без возможности восстановления.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-border rounded py-2.5 text-sm font-oswald text-muted-foreground hover:text-navy transition-colors">Отмена</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2.5 text-sm font-oswald transition-colors">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
