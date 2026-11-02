import React, { useState } from 'react';
import {
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { Patient, HealthCategory } from '../../types/pharmacy';
import { parseLeadsCsv, generateSampleCsv } from '../../utils/pharmacyLogic';

interface CsvLeadUploaderProps {
  onImportPatients: (patients: Partial<Patient>[]) => void;
  onAddManualPatient: (patient: Patient) => void;
}

export const CsvLeadUploader: React.FC<CsvLeadUploaderProps> = ({
  onImportPatients,
  onAddManualPatient,
}) => {
  const [activeMode, setActiveMode] = useState<'csv' | 'manual'>('csv');
  const [csvContent, setCsvContent] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Partial<Patient>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Manual Lead Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [healthCategory, setHealthCategory] = useState<HealthCategory>('Cardiology / Hypertension');
  const [medicationName, setMedicationName] = useState('');
  const [rxNumber, setRxNumber] = useState('');
  const [renewalDate, setRenewalDate] = useState('2026-11-15');
  const [primaryDoctor, setPrimaryDoctor] = useState('Dr. Helen Brody, MD');

  const handleDownloadSample = () => {
    const csvData = generateSampleCsv();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pharmacy_leads_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContent(text);
        runParse(text);
      };
      reader.readAsText(file);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvContent(text);
    runParse(text);
  };

  const runParse = (text: string) => {
    if (!text.trim()) {
      setParsedPreview([]);
      setParseErrors([]);
      return;
    }
    const result = parseLeadsCsv(text);
    setParsedPreview(result.patients);
    setParseErrors(result.errors);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImportPatients(parsedPreview);
    setImportSuccessMessage(
      `Successfully synchronized and imported ${parsedPreview.length} customer leads into CRM database.`
    );
    setParsedPreview([]);
    setCsvContent('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      firstName,
      lastName,
      email,
      phone: phone || '+1 (555) 000-0000',
      dateOfBirth: '1980-01-01',
      address: 'Springfield Regional Delivery Area',
      insuranceProvider: 'Standard Healthcare Preferred',
      insurancePolicyNumber: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      healthCategory,
      primaryDoctor,
      allergies: [],
      activeMedicationsCount: medicationName ? 1 : 0,
      nextRenewalDate: renewalDate,
      leadSource: 'Manual Entry',
      createdAt: '2026-11-02',
      notes: [],
      refillHistory: medicationName
        ? [
            {
              id: `ref-manual-${Date.now()}`,
              rxNumber: rxNumber || `RX-${Math.floor(100000 + Math.random() * 900000)}`,
              medicationName,
              strength: 'Standard Dosage',
              dosageForm: 'Oral Tablet',
              quantity: 30,
              daysSupply: 30,
              providerDoctor: primaryDoctor,
              doctorClinic: 'Regional Clinical Group',
              dateFilled: '2026-10-15',
              nextRefillDue: renewalDate,
              remainingRefills: 2,
              status: 'Active',
              refillInstructions: 'Take once daily as directed.',
            },
          ]
        : [],
    };

    onAddManualPatient(newPatient);
    setImportSuccessMessage(`Added patient ${firstName} ${lastName} to CRM database.`);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setMedicationName('');
    setRxNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Lead Ingestion &amp; Patient Onboarding</h3>
          <p className="text-xs text-slate-500">
            Upload new pharmacy leads via CSV batch files or add individual patients manually
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveMode('csv');
              setImportSuccessMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeMode === 'csv'
                ? 'bg-teal-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV File Import
          </button>
          <button
            onClick={() => {
              setActiveMode('manual');
              setImportSuccessMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeMode === 'manual'
                ? 'bg-teal-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Manual Entry
          </button>
        </div>
      </div>

      {importSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="font-semibold">{importSuccessMessage}</span>
          </div>
          <button
            onClick={() => setImportSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CSV IMPORT MODE */}
      {activeMode === 'csv' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select or Paste CSV File
                </span>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV Template
                </button>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="border-2 border-dashed border-slate-200 hover:border-teal-700 rounded-xl p-6 text-center bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="csv-file-picker"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-picker"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-teal-700" />
                  <span className="text-xs font-bold text-slate-900">
                    Click to browse your CSV file or drag here
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Columns: first_name, last_name, email, phone, health_category, medication_name, rx_number, renewal_date, primary_doctor
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Paste Raw CSV Data Directly:
                </label>
                <textarea
                  value={csvContent}
                  onChange={handleTextareaChange}
                  rows={6}
                  placeholder="first_name,last_name,email,phone,health_category,medication_name,rx_number,renewal_date,primary_doctor..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const sample = generateSampleCsv();
                    setCsvContent(sample);
                    runParse(sample);
                  }}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  Load Pre-filled Sample Data
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={parsedPreview.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors"
                >
                  Import {parsedPreview.length} Leads
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Parsed Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Parsed Records Preview ({parsedPreview.length})
                </h4>
                {parsedPreview.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                    Ready to Ingest
                  </span>
                )}
              </div>

              {parseErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                  {parseErrors.map((err, i) => (
                    <p key={i} className="text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {parsedPreview.length > 0 ? (
                <div className="overflow-x-auto max-h-[380px] border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5">Name</th>
                        <th className="py-2 px-2.5">Category</th>
                        <th className="py-2 px-2.5">Email / Phone</th>
                        <th className="py-2 px-2.5">Medication</th>
                        <th className="py-2 px-2.5">Renewal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedPreview.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-semibold text-slate-900 whitespace-nowrap">
                            {p.firstName} {p.lastName}
                          </td>
                          <td className="py-2 px-2.5 text-teal-800 whitespace-nowrap">
                            {p.healthCategory}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-[11px] text-slate-600">
                            <div>{p.email}</div>
                            <div>{p.phone}</div>
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">
                              {p.refillHistory?.[0]?.medicationName || '—'}
                            </span>
                            <span className="block text-[11px] text-slate-400 font-mono">
                              {p.refillHistory?.[0]?.rxNumber}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 font-mono text-slate-700 whitespace-nowrap">
                            {p.nextRenewalDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
                  <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p>No CSV data loaded yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload a file or click "Load Pre-filled Sample Data" to see how leads are mapped.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MANUAL ENTRY MODE */
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-3xl">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Individual Patient Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Samuel"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. O'Connor"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="samuel.o@example.com"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 782-9912"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Health Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={healthCategory}
                  onChange={(e) => setHealthCategory(e.target.value as HealthCategory)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Sleep">Sleep</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Energy & Focus">Energy &amp; Focus</option>
                  <option value="Cardiology / Hypertension">Cardiology / Hypertension</option>
                  <option value="Diabetes Care">Diabetes Care</option>
                  <option value="Asthma & Respiratory">Asthma &amp; Respiratory</option>
                  <option value="Digestive Health">Digestive Health</option>
                  <option value="Daily Wellness">Daily Wellness</option>
                  <option value="General Care">General Care</option>
                  <option value="General Care">General Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescribing Physician
                </label>
                <input
                  type="text"
                  value={primaryDoctor}
                  onChange={(e) => setPrimaryDoctor(e.target.value)}
                  placeholder="Dr. Helen Brody, MD"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 pt-2">
              Initial Medication &amp; Refill Schedule
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  placeholder="e.g. Amlodipine 5mg"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rx Number
                </label>
                <input
                  type="text"
                  value={rxNumber}
                  onChange={(e) => setRxNumber(e.target.value)}
                  placeholder="e.g. RX-224419"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors"
              >
                Save Patient Profile &amp; Refill History
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
