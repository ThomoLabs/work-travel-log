import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CarFront,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

const emptyEntry = {
  id: "",
  onoma: "",
  imerominia: "",
  oraAnaxorisis: "",
  proorismos: "",
  xlmAfiksis: "",
  kausimo: "",
  oraEpistrofis: "",
};

const todayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const storageKeyForDate = (date) => `work-travel-log-${date || todayString()}`;

const generateId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `trip-${Date.now()}-${randomPart}`;
};

const safeReadStorage = (key) => {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error("Failed to read travel log from localStorage", error);
    return null;
  }
};

const safeWriteStorage = (key, value) => {
  try {
    if (typeof window === "undefined") return true;
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error("Failed to save travel log to localStorage", error);
    return false;
  }
};

const safeRemoveStorage = (key) => {
  try {
    if (typeof window === "undefined") return true;
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Failed to remove travel log from localStorage", error);
    return false;
  }
};

const createEmptyEntryForDate = (date, employeeName = "") => ({
  ...emptyEntry,
  id: generateId(),
  onoma: employeeName,
  imerominia: date || todayString(),
});

const sanitizeKilometers = (value) =>
  String(value || "")
    .replace(/[^0-9]/g, "")
    .slice(0, 8);

const sanitizeFuel = (value) => {
  const digitsOnly = String(value || "").replace(/[^0-9]/g, "");
  if (digitsOnly === "") return "";
  const normalized = Math.max(0, Math.min(100, Number(digitsOnly)));
  return String(normalized);
};

const isEntryEmpty = (entry) => {
  if (!entry) return true;

  return [
    entry.onoma,
    entry.oraAnaxorisis,
    entry.proorismos,
    entry.xlmAfiksis,
    entry.kausimo,
    entry.oraEpistrofis,
  ].every((value) => String(value || "").trim() === "");
};

const normalizeEntry = (entry, selectedDate) => ({
  ...createEmptyEntryForDate(selectedDate),
  ...entry,
  id: entry?.id || generateId(),
  imerominia: entry?.imerominia || selectedDate || todayString(),
  xlmAfiksis: sanitizeKilometers(entry?.xlmAfiksis),
  kausimo: sanitizeFuel(entry?.kausimo),
});

const sanitizeEntries = (entries, selectedDate) => {
  if (!Array.isArray(entries)) {
    return [createEmptyEntryForDate(selectedDate)];
  }

  const cleaned = entries
    .map((entry) => normalizeEntry(entry, selectedDate))
    .filter((entry, index, array) => !isEntryEmpty(entry) || array.length === 1);

  return cleaned.length > 0 ? cleaned : [createEmptyEntryForDate(selectedDate)];
};

const parseSavedLog = (saved, selectedDate) => {
  if (!saved) {
    return {
      employeeName: "",
      entries: [createEmptyEntryForDate(selectedDate)],
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      employeeName: typeof parsed.employeeName === "string" ? parsed.employeeName : "",
      entries: sanitizeEntries(parsed.entries, selectedDate),
    };
  } catch (error) {
    console.error("Failed to parse saved travel log", error);
    return {
      employeeName: "",
      entries: [createEmptyEntryForDate(selectedDate)],
    };
  }
};

const getEntryErrors = (entry) => {
  const errors = {};
  const fuelValue = entry.kausimo === "" ? null : Number(entry.kausimo);

  if (entry.xlmAfiksis && !/^\d+$/.test(String(entry.xlmAfiksis))) {
    errors.xlmAfiksis = "Τα χιλιομετρα πρεπει να ειναι μονο αριθμοι.";
  }

  if (
    entry.kausimo !== "" &&
    (Number.isNaN(fuelValue) || fuelValue < 0 || fuelValue > 100)
  ) {
    errors.kausimo = "Το καυσιμο πρεπει να ειναι απο 0 εως 100.";
  }

  return errors;
};

function test(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`Test failed: ${name}`, error);
    throw error;
  }
}

function runBasicTests() {
  test("todayString returns YYYY-MM-DD", () => {
    if (todayString().length !== 10) throw new Error("Invalid date length");
  });

  test("storageKeyForDate builds correct key", () => {
    if (storageKeyForDate("2026-03-21") !== "work-travel-log-2026-03-21") {
      throw new Error("Wrong storage key");
    }
  });

  test("isEntryEmpty detects blank entry", () => {
    if (isEntryEmpty(emptyEntry) !== true) throw new Error("Blank entry not detected");
  });

  test("sanitizeKilometers keeps only digits", () => {
    if (sanitizeKilometers("12a,450km") !== "12450") {
      throw new Error("Kilometer sanitization failed");
    }
  });

  test("sanitizeFuel clamps values to 0-100", () => {
    if (sanitizeFuel("150") !== "100") throw new Error("Fuel high clamp failed");
  });
}

runBasicTests();

function Card({ className = "", children }) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/30 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function CardTitle({ className = "", children }) {
  return <h2 className={`font-semibold ${className}`}>{children}</h2>;
}

function CardContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800 border border-slate-200",
    destructive: "bg-red-50 text-red-700 border border-red-200",
    outline: "bg-white text-slate-700 border border-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 ${props.className || ""}`}
    />
  );
}

function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <TextInput {...props} className={`pl-10 ${props.className || ""}`} />
    </div>
  );
}

function ActionButton({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900",
    outline: "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium shadow-sm transition ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function TableShell({ children }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200">{children}</div>;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [employeeName, setEmployeeName] = useState("");
  const [entries, setEntries] = useState([createEmptyEntryForDate(todayString())]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    const saved = safeReadStorage(storageKeyForDate(selectedDate));
    const parsed = parseSavedLog(saved, selectedDate);

    setEmployeeName(parsed.employeeName);
    setEntries(parsed.entries);
    setStorageAvailable(saved !== null || typeof window !== "undefined");
  }, [selectedDate]);

  useEffect(() => {
    const sanitized = sanitizeEntries(entries, selectedDate);
    const payload = {
      selectedDate,
      employeeName,
      entries: sanitized,
      savedAt: new Date().toISOString(),
    };

    const writeOk = safeWriteStorage(storageKeyForDate(selectedDate), JSON.stringify(payload));
    setStorageAvailable(writeOk);
  }, [selectedDate, employeeName, entries]);

  const updateEntry = (entryId, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;

        if (field === "xlmAfiksis") {
          return { ...entry, [field]: sanitizeKilometers(value) };
        }

        if (field === "kausimo") {
          return { ...entry, [field]: sanitizeFuel(value) };
        }

        return { ...entry, [field]: value };
      })
    );
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, createEmptyEntryForDate(selectedDate, employeeName.trim())]);
  };

  const clearDay = () => {
    safeRemoveStorage(storageKeyForDate(selectedDate));
    setEmployeeName("");
    setEntries([createEmptyEntryForDate(selectedDate)]);
    setConfirmClearOpen(false);
  };

  const removeEntry = (entryId) => {
    setEntries((prev) => {
      if (prev.length <= 1) {
        return [createEmptyEntryForDate(selectedDate, employeeName.trim())];
      }

      const filtered = prev.filter((entry) => entry.id !== entryId);
      return filtered.length > 0
        ? filtered
        : [createEmptyEntryForDate(selectedDate, employeeName.trim())];
    });
  };

  const fillNames = () => {
    const trimmedName = employeeName.trim();
    setEntries((prev) => prev.map((entry) => ({ ...entry, onoma: trimmedName })));
  };

  const visibleEntries = useMemo(
    () => entries.filter((entry) => !isEntryEmpty(entry)),
    [entries]
  );

  const totalTrips = visibleEntries.length;
  const formHasErrors = visibleEntries.some(
    (entry) => Object.keys(getEntryErrors(entry)).length > 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <CarFront className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Work Travel Log
              </h1>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl text-slate-900">Στοιχεια Ημερας</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Auto Save</Badge>
                {!storageAvailable && <Badge tone="destructive">Storage Error</Badge>}
                {formHasErrors && <Badge tone="outline">Validation Needed</Badge>}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Ημερομηνια ημερας
                </label>
                <IconInput
                  icon={CalendarDays}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Ονομα εργαζομενου
                </label>
                <IconInput
                  icon={UserRound}
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="π.χ. Κουρτελης"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <ActionButton onClick={fillNames} className="min-h-12 w-full text-center leading-snug">
                  Συμπληρωση ονοματος σε ολες τις εγγραφες
                </ActionButton>
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 text-sm shadow-sm">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Συνολο διαδρομων
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{totalTrips}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {visibleEntries.map((entry, index) => {
            const errors = getEntryErrors(entry);

            return (
              <Card key={entry.id} className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 bg-slate-50/70">
                  <CardTitle className="text-lg">Διαδρομη {index + 1}</CardTitle>

                  {entries.length > 1 && (
                    <ActionButton
                      variant="outline"
                      className="h-10 w-10 p-0"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </ActionButton>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Ονομα</label>
                      <TextInput
                        value={entry.onoma}
                        onChange={(e) => updateEntry(entry.id, "onoma", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Ημερομηνια</label>
                      <TextInput
                        type="date"
                        value={entry.imerominia}
                        onChange={(e) => updateEntry(entry.id, "imerominia", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Ωρα αναχωρισης
                      </label>
                      <TextInput
                        type="time"
                        value={entry.oraAnaxorisis}
                        onChange={(e) => updateEntry(entry.id, "oraAnaxorisis", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Προορισμος</label>
                      <TextInput
                        value={entry.proorismos}
                        onChange={(e) => updateEntry(entry.id, "proorismos", e.target.value)}
                        placeholder="π.χ. Πελατης / Περιοχη"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">ΧΛΜ αφιξης</label>
                      <TextInput
                        type="text"
                        inputMode="numeric"
                        value={entry.xlmAfiksis}
                        onChange={(e) => updateEntry(entry.id, "xlmAfiksis", e.target.value)}
                        placeholder="π.χ. 124560"
                      />
                      {errors.xlmAfiksis && (
                        <p className="text-xs text-red-600">{errors.xlmAfiksis}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Ποσοστο % καυσιμου
                      </label>
                      <TextInput
                        type="text"
                        inputMode="numeric"
                        value={entry.kausimo}
                        onChange={(e) => updateEntry(entry.id, "kausimo", e.target.value)}
                        placeholder="π.χ. 65"
                      />
                      {errors.kausimo && (
                        <p className="text-xs text-red-600">{errors.kausimo}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Ωρα αφιξης
                      </label>
                      <TextInput
                        type="time"
                        value={entry.oraEpistrofis}
                        onChange={(e) => updateEntry(entry.id, "oraEpistrofis", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex flex-wrap gap-3 pt-2">
            <ActionButton onClick={addEntry}>
              <Plus className="mr-2 h-4 w-4" /> Προσθηκη διαδρομης
            </ActionButton>

            <ActionButton variant="outline" onClick={() => setConfirmClearOpen(true)}>
              Καθαρισμος ημερας
            </ActionButton>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-slate-50/70">
            <div className="space-y-3">
              <CardTitle className="text-xl text-slate-900">
                Προεπισκοπηση Καταχωρησεων
              </CardTitle>
              <div className="h-px bg-slate-200" />
            </div>
          </CardHeader>

          <CardContent>
            <TableShell>
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Ονομα</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Ημερομηνια
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Ωρα αναχωρισης
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Προορισμος
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      ΧΛΜ αφιξης
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Ποσοστο % καυσιμου
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Ωρα αφιξης
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleEntries.map((entry) => (
                    <tr
                      key={`preview-${entry.id}`}
                      className="border-t border-slate-200 hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{entry.onoma}</td>
                      <td className="px-4 py-3">{entry.imerominia}</td>
                      <td className="px-4 py-3">{entry.oraAnaxorisis}</td>
                      <td className="px-4 py-3">{entry.proorismos}</td>
                      <td className="px-4 py-3">{entry.xlmAfiksis}</td>
                      <td className="px-4 py-3">
                        {entry.kausimo ? `${entry.kausimo}%` : ""}
                      </td>
                      <td className="px-4 py-3">{entry.oraEpistrofis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </CardContent>
        </Card>
      </div>

      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-50 p-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Να διαγραφουν τα δεδομενα της ημερας;
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Αυτη η ενεργεια θα καθαρισει ολες τις διαδρομες της επιλεγμενης
                  ημερομηνιας απο τη συσκευη.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <ActionButton variant="outline" onClick={() => setConfirmClearOpen(false)}>
                Ακυρωση
              </ActionButton>
              <ActionButton variant="danger" onClick={clearDay}>
                Καθαρισμος
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}