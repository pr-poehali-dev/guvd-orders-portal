import { useState } from "react";
import Icon from "@/components/ui/icon";

type OrderType = "dismiss" | "promote" | "reprimand" | "verbal" | "reward" | "hire" | "custom";

interface OrderTemplate {
  id: OrderType;
  label: string;
  icon: string;
  color: string;
  title: string;
  preamble: string;
  points: string[];
  extraFields?: { key: string; label: string; placeholder: string }[];
}

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const TEMPLATES: OrderTemplate[] = [
  {
    id: "dismiss",
    label: "Увольнение",
    icon: "UserMinus",
    color: "bg-red-50 text-red-700 border-red-200",
    title: "Об увольнении",
    preamble: "",
    points: [
      "Уволить сотрудника, {rank} {name} в связи с {reason}",
      "Состояние ДВ: {dv}",
      "Сотрудник увольняется без внесения в ОЧС.",
      "Контроль за исполнением данного приказа остается за мной.",
    ],
    extraFields: [
      { key: "reason", label: "Основание (статья)", placeholder: "35.1 ФЗоП(ПСЖ)" },
      { key: "dv", label: "Состояние ДВ", placeholder: "[0/3](0/3){0/2}" },
    ],
  },
  {
    id: "promote",
    label: "Повышение",
    icon: "TrendingUp",
    color: "bg-green-50 text-green-700 border-green-200",
    title: "О присвоении специального звания",
    preamble: "",
    points: [
      "Присвоить сотруднику {rank} {name} специальное звание {newRank}.",
      "Основание: {reason}",
      "Контроль за исполнением данного приказа остается за мной.",
    ],
    extraFields: [
      { key: "newRank", label: "Новое звание", placeholder: "Лейтенант полиции" },
      { key: "reason", label: "Основание", placeholder: "выслуга лет, успешное несение службы" },
    ],
  },
  {
    id: "reprimand",
    label: "Выговор",
    icon: "AlertTriangle",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    title: "О наложении дисциплинарного взыскания (выговор)",
    preamble: "",
    points: [
      "Объявить выговор сотруднику {rank} {name}.",
      "Основание: {reason}",
      "Состояние ДВ: {dv}",
      "Контроль за исполнением данного приказа остается за мной.",
    ],
    extraFields: [
      { key: "reason", label: "Основание", placeholder: "нарушение служебной дисциплины" },
      { key: "dv", label: "Состояние ДВ после взыскания", placeholder: "[1/3](0/3){0/2}" },
    ],
  },
  {
    id: "verbal",
    label: "Устный выговор",
    icon: "MessageSquareWarning",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    title: "О наложении дисциплинарного взыскания (устный выговор)",
    preamble: "",
    points: [
      "Объявить устный выговор сотруднику {rank} {name}.",
      "Основание: {reason}",
      "Состояние ДВ: {dv}",
      "Контроль за исполнением данного приказа остается за мной.",
    ],
    extraFields: [
      { key: "reason", label: "Основание", placeholder: "ненадлежащее исполнение служебных обязанностей" },
      { key: "dv", label: "Состояние ДВ после взыскания", placeholder: "[0/3](1/3){0/2}" },
    ],
  },
  {
    id: "reward",
    label: "Поощрение",
    icon: "Award",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    title: "О поощрении сотрудника",
    preamble: "",
    points: [
      "Объявить благодарность сотруднику {rank} {name}.",
      "Основание: {reason}",
      "Контроль за исполнением данного приказа остается за мной.",
    ],
    extraFields: [
      { key: "reason", label: "Основание", placeholder: "добросовестное исполнение служебных обязанностей" },
    ],
  },
  {
    id: "hire",
    label: "Принятие",
    icon: "UserPlus",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    title: "О принятии на службу",
    preamble: "",
    points: [
      "Принять на службу в {dept} {rank} {name}.",
      "Назначить испытательный срок: {probation}.",
      "Контроль за исполнением данного приказа остается за мной.",
    ],
    extraFields: [
      { key: "dept", label: "Подразделение", placeholder: "ОМВД по г. Приволжску" },
      { key: "probation", label: "Испытательный срок", placeholder: "7 дней" },
    ],
  },
  {
    id: "custom",
    label: "Свободный",
    icon: "FileEdit",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Произвольный приказ",
    preamble: "",
    points: [],
    extraFields: [],
  },
];

function buildText(
  template: OrderTemplate,
  fields: Record<string, string>,
  orderNum: string,
  orderDate: string,
  dept: string,
  authorRank: string,
  authorName: string,
  signerRank: string,
  signerName: string,
  customBody: string,
) {
  const fill = (s: string) =>
    s.replace(/\{(\w+)\}/g, (_, k) => fields[k] || `[${k}]`);

  const title = fill(template.title);

  let points: string[];
  if (template.id === "custom") {
    points = customBody.split("\n").filter(Boolean);
  } else {
    points = template.points.map(fill);
  }

  const numbered = points.map((p, i) => `${i + 1}. ${p}`).join("\n\n");

  return `[${dept}] Приказ #${orderNum} от ${orderDate}

"${title}"

${numbered}

Приказ оформил: ${authorRank} ${authorName}
Приказ подписали: ${signerRank} ${signerName}`;
}

export default function OrderGenerator() {
  const [selectedType, setSelectedType] = useState<OrderType>("dismiss");
  const [copied, setCopied] = useState(false);

  // Header fields
  const [orderNum, setOrderNum] = useState("");
  const [orderDate, setOrderDate] = useState(today());
  const [dept, setDept] = useState("ОМВД-П");

  // Target employee
  const [empRank, setEmpRank] = useState("");
  const [empName, setEmpName] = useState("");

  // Extra template fields
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});

  // Custom body
  const [customBody, setCustomBody] = useState("");

  // Author / signer
  const [authorRank, setAuthorRank] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [signerRank, setSignerRank] = useState("");
  const [signerName, setSignerName] = useState("");

  const template = TEMPLATES.find((t) => t.id === selectedType)!;

  const setExtra = (key: string, val: string) =>
    setExtraFields((prev) => ({ ...prev, [key]: val }));

  const allFields: Record<string, string> = {
    rank: empRank,
    name: empName,
    ...extraFields,
  };

  const preview = buildText(
    template,
    allFields,
    orderNum || "XXXX",
    orderDate,
    dept,
    authorRank,
    authorName,
    signerRank,
    signerName,
    customBody,
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="font-oswald text-2xl text-navy font-semibold">Генератор приказов</h2>
        <p className="text-muted-foreground text-sm font-ibm">Выберите тип, заполните поля — скопируйте готовый текст</p>
      </div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedType(t.id);
              setExtraFields({});
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-oswald tracking-wide transition-all
              ${selectedType === t.id
                ? `${t.color} border-current font-semibold shadow-sm`
                : "bg-white border-border text-muted-foreground hover:border-navy/30 hover:text-navy"
              }`}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Form */}
        <div className="space-y-4">
          {/* Header block */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="bg-navy/5 border-b border-border px-4 py-2.5">
              <span className="font-oswald text-navy text-xs tracking-wide uppercase">Шапка приказа</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Подразделение</label>
                  <input
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    placeholder="ОМВД-П"
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Номер приказа</label>
                  <input
                    value={orderNum}
                    onChange={(e) => setOrderNum(e.target.value)}
                    placeholder="0829"
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Дата</label>
                <input
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  placeholder="22.03.2026"
                  className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Employee block */}
          {template.id !== "custom" && (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="bg-navy/5 border-b border-border px-4 py-2.5">
                <span className="font-oswald text-navy text-xs tracking-wide uppercase">Сотрудник</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Звание и должность</label>
                  <input
                    value={empRank}
                    onChange={(e) => setEmpRank(e.target.value)}
                    placeholder="Звание и должность сотрудника"
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Имя (ник)</label>
                  <input
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="Ethan_Santoro"
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                  />
                </div>
                {(template.extraFields ?? []).map((f) => (
                  <div key={f.key}>
                    <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">{f.label}</label>
                    <input
                      value={extraFields[f.key] ?? ""}
                      onChange={(e) => setExtra(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom body */}
          {template.id === "custom" && (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="bg-navy/5 border-b border-border px-4 py-2.5">
                <span className="font-oswald text-navy text-xs tracking-wide uppercase">Название и содержание</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Заголовок приказа</label>
                  <input
                    value={extraFields["customTitle"] ?? ""}
                    onChange={(e) => setExtra("customTitle", e.target.value)}
                    placeholder="О проведении учений"
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Пункты (каждый с новой строки)</label>
                  <textarea
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={5}
                    placeholder={"Провести учения 25.04.2026\nОбязать личный состав явиться в форме\nКонтроль за исполнением остается за мной."}
                    className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Author block */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="bg-navy/5 border-b border-border px-4 py-2.5">
              <span className="font-oswald text-navy text-xs tracking-wide uppercase">Подписи</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Оформил (должность и звание)</label>
                <input
                  value={authorRank}
                  onChange={(e) => setAuthorRank(e.target.value)}
                  placeholder="Должность Ethan_Santoro, звание"
                  className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Оформил (имя)</label>
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ethan_Santoro"
                  className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Подписал (должность и звание)</label>
                <input
                  value={signerRank}
                  onChange={(e) => setSignerRank(e.target.value)}
                  placeholder="Должность подписанта, звание"
                  className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-oswald text-navy/70 tracking-wide uppercase block mb-1">Подписал (имя)</label>
                <input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Ithan_Santoro"
                  className="w-full border border-border rounded px-3 py-2 text-sm font-ibm outline-none focus:border-navy/40 focus:ring-1 focus:ring-navy/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-lg border border-border overflow-hidden flex-1 flex flex-col">
            <div className="bg-navy px-4 py-2.5 flex items-center justify-between">
              <span className="font-oswald text-white text-xs tracking-wide uppercase">Предпросмотр</span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-oswald tracking-wide transition-all
                  ${copied
                    ? "bg-green-500 text-white"
                    : "bg-gold hover:bg-yellow-400 text-navy"
                  }`}
              >
                <Icon name={copied ? "Check" : "Copy"} size={13} />
                {copied ? "Скопировано!" : "Копировать"}
              </button>
            </div>
            <pre className="p-4 text-sm font-ibm text-foreground whitespace-pre-wrap leading-relaxed flex-1 overflow-auto bg-[#f8f9fc] min-h-[300px]">
              {template.id === "custom"
                ? buildText(
                    { ...template, title: extraFields["customTitle"] || template.title },
                    allFields,
                    orderNum || "XXXX",
                    orderDate,
                    dept,
                    authorRank,
                    authorName,
                    signerRank,
                    signerName,
                    customBody,
                  )
                : preview}
            </pre>
          </div>
          <p className="text-[11px] text-muted-foreground font-ibm text-center">
            Текст обновляется в реальном времени · Нажмите «Копировать» для вставки в чат
          </p>
        </div>
      </div>
    </div>
  );
}