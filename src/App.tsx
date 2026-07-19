import { type FormEvent, useMemo, useRef, useState } from 'react';
import {
  estimateBenefits,
  RATE_METADATA,
  type BilateralCategory,
  type CalculatorEntry,
  type Dependents,
  type Side,
} from './lib/app-calculator';

const MAX_ENTRIES = 30;
const MAX_BILATERAL_ENTRIES = 20;
const MAX_LABEL_LENGTH = 80;
const PERCENTAGES = Array.from({ length: 11 }, (_, index) => index * 10);

const defaultDependents: Dependents = {
  spouse: false,
  parents: 0,
  childrenUnder18: 0,
  schoolChildrenOver18: 0,
  spouseAidAndAttendance: false,
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function newId(): string {
  return crypto.randomUUID();
}

function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, MAX_LABEL_LENGTH);
}

function describeBilateral(entry: CalculatorEntry): string {
  if (entry.bilateralCategory === 'none') return 'Not in a bilateral group';
  const category =
    entry.bilateralCategory === 'upper'
      ? 'upper extremity'
      : entry.bilateralCategory === 'lower'
        ? 'lower extremity'
        : `paired muscle: ${entry.muscleGroup}`;
  return `${entry.side} ${category}`;
}

export function App() {
  const [entries, setEntries] = useState<CalculatorEntry[]>([]);
  const [label, setLabel] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [bilateralCategory, setBilateralCategory] =
    useState<BilateralCategory>('none');
  const [side, setSide] = useState<Side>('left');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [dependents, setDependents] = useState<Dependents>(defaultDependents);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const labelRef = useRef<HTMLInputElement>(null);
  const muscleRef = useRef<HTMLInputElement>(null);
  const removeRefs = useRef(new Map<string, HTMLButtonElement>());

  const estimate = useMemo(
    () => (entries.length > 0 ? estimateBenefits(entries, dependents) : null),
    [entries, dependents],
  );

  const isRateReviewDue = new Date() >= new Date(`${RATE_METADATA.reviewDueDate}T00:00:00`);

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (entries.length >= MAX_ENTRIES) {
      setError(`A maximum of ${MAX_ENTRIES} ratings can be entered.`);
      labelRef.current?.focus();
      return;
    }

    if (
      bilateralCategory !== 'none' &&
      entries.filter((entry) => entry.bilateralCategory !== 'none').length >=
        MAX_BILATERAL_ENTRIES
    ) {
      setError(
        `A maximum of ${MAX_BILATERAL_ENTRIES} bilateral-classified ratings can be compared exactly.`,
      );
      labelRef.current?.focus();
      return;
    }

    if (bilateralCategory === 'muscle' && !normalizeLabel(muscleGroup)) {
      setError('Enter a paired muscle group name before adding this rating.');
      muscleRef.current?.focus();
      return;
    }

    const entry: CalculatorEntry = {
      id: newId(),
      label: normalizeLabel(label) || `Rating ${entries.length + 1}`,
      percentage,
      bilateralCategory,
      side: bilateralCategory === 'none' ? 'none' : side,
      muscleGroup:
        bilateralCategory === 'muscle' ? normalizeLabel(muscleGroup).toLowerCase() : undefined,
    };

    setEntries((current) => [...current, entry]);
    setLabel('');
    setMuscleGroup('');
    setStatus(`${entry.label}, ${entry.percentage} percent, added.`);
    labelRef.current?.focus();
  }

  function removeEntry(entry: CalculatorEntry, index: number) {
    const focusTarget = entries[index + 1]?.id ?? entries[index - 1]?.id;
    setEntries((current) => current.filter(({ id }) => id !== entry.id));
    setStatus(`${entry.label} removed.`);
    requestAnimationFrame(() => {
      if (focusTarget) removeRefs.current.get(focusTarget)?.focus();
      else labelRef.current?.focus();
    });
  }

  function clearAll() {
    setEntries([]);
    setLabel('');
    setPercentage(10);
    setBilateralCategory('none');
    setSide('left');
    setMuscleGroup('');
    setDependents(defaultDependents);
    setError('');
    setStatus('All ratings and dependent selections cleared.');
    labelRef.current?.focus();
  }

  function updateCount(
    key: 'parents' | 'childrenUnder18' | 'schoolChildrenOver18',
    value: string,
  ) {
    const maximum = key === 'parents' ? 2 : 20;
    const parsed = Number(value);
    const count = Number.isFinite(parsed)
      ? Math.min(maximum, Math.max(0, Math.trunc(parsed)))
      : 0;
    setDependents((current) => ({ ...current, [key]: count }));
    setStatus('Dependent selection updated.');
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="mark" aria-hidden="true">
            VA
          </div>
          <div>
            <p className="eyebrow">Independent educational estimator</p>
            <h1>VA Math Machine</h1>
            <p className="header-summary">
              Estimate a combined disability rating and basic monthly compensation using
              current VA rules and rates.
            </p>
            <p className="privacy-note">
              Entries stay in this browser tab and are cleared on refresh. GitHub Pages still
              receives ordinary web-request information, including IP addresses.
            </p>
          </div>
        </div>
      </header>

      <main className="page-shell" id="calculator">
        <aside className="notice" aria-label="Important disclaimer">
          <strong>Estimate only.</strong> This tool is not affiliated with or endorsed by the
          U.S. Department of Veterans Affairs and does not replace a VA decision or professional
          claims advice.
        </aside>

        {isRateReviewDue && (
          <aside className="notice" role="alert">
            Compensation data reached its scheduled review date on{' '}
            {RATE_METADATA.reviewDueDate}. Payment estimates are disabled until the table is
            verified.
          </aside>
        )}

        <div className="layout">
          <div className="stack calculator-column">
            <section className="card" aria-labelledby="ratings-title">
              <h2 id="ratings-title">1. Add assigned ratings</h2>
              <p className="section-intro">
                Enter the percentages in your VA decision. A condition label is optional and
                never changes the calculation.
              </p>

              <form onSubmit={addEntry} noValidate>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="condition-label">Condition label (optional)</label>
                    <input
                      id="condition-label"
                      ref={labelRef}
                      value={label}
                      maxLength={MAX_LABEL_LENGTH}
                      aria-describedby="condition-help"
                      onChange={(event) => setLabel(event.target.value)}
                    />
                    <span className="help" id="condition-help">
                      Up to {MAX_LABEL_LENGTH} characters; avoid sensitive details.
                    </span>
                  </div>

                  <div className="field">
                    <label htmlFor="rating-percentage">Assigned rating</label>
                    <select
                      id="rating-percentage"
                      value={percentage}
                      onChange={(event) => setPercentage(Number(event.target.value))}
                    >
                      {PERCENTAGES.map((value) => (
                        <option key={value} value={value}>
                          {value}%
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <fieldset className="rate-details">
                  <legend>Bilateral-factor classification</legend>
                  <p className="help" id="bilateral-help">
                    Use only for paired upper extremities, paired lower extremities, or the same
                    paired skeletal muscle group under 38 C.F.R. § 4.26. Both sides must be
                    compensable.
                  </p>
                  <div className="field-grid three">
                    <div className="field">
                      <label htmlFor="bilateral-category">Category</label>
                      <select
                        id="bilateral-category"
                        aria-describedby="bilateral-help"
                        value={bilateralCategory}
                        onChange={(event) =>
                          setBilateralCategory(event.target.value as BilateralCategory)
                        }
                      >
                        <option value="none">Not bilateral</option>
                        <option value="upper">Upper extremity</option>
                        <option value="lower">Lower extremity</option>
                        <option value="muscle">Paired skeletal muscle</option>
                      </select>
                    </div>

                    {bilateralCategory !== 'none' && (
                      <div className="field">
                        <label htmlFor="bilateral-side">Affected side</label>
                        <select
                          id="bilateral-side"
                          value={side}
                          onChange={(event) => setSide(event.target.value as Side)}
                        >
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    )}

                    {bilateralCategory === 'muscle' && (
                      <div className="field">
                        <label htmlFor="muscle-group">Muscle group</label>
                        <input
                          id="muscle-group"
                          ref={muscleRef}
                          value={muscleGroup}
                          maxLength={MAX_LABEL_LENGTH}
                          aria-invalid={Boolean(error && !normalizeLabel(muscleGroup))}
                          aria-describedby={error ? 'entry-error' : undefined}
                          onChange={(event) => setMuscleGroup(event.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </fieldset>

                {error && (
                  <p className="notice" id="entry-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="actions">
                  <button className="button" type="submit">
                    Add rating
                  </button>
                  <button
                    className="button danger"
                    type="button"
                    disabled={entries.length === 0}
                    onClick={clearAll}
                  >
                    Clear all
                  </button>
                </div>
              </form>

              {entries.length === 0 ? (
                <p className="muted">No ratings added. No estimate is available.</p>
              ) : (
                <ol className="ratings-list" aria-label="Entered ratings">
                  {entries.map((entry, index) => (
                    <li className="rating-row" key={entry.id}>
                      <div>
                        <strong>
                          {entry.label}: {entry.percentage}%
                        </strong>
                        <span className="rating-meta">{describeBilateral(entry)}</span>
                      </div>
                      <button
                        className="icon-button"
                        type="button"
                        ref={(node) => {
                          if (node) removeRefs.current.set(entry.id, node);
                          else removeRefs.current.delete(entry.id);
                        }}
                        onClick={() => removeEntry(entry, index)}
                        aria-label={`Remove ${entry.label}, ${entry.percentage} percent`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="card" aria-labelledby="dependents-title">
              <h2 id="dependents-title">2. Add dependent information</h2>
              <p className="section-intro">
                Dependent additions apply only at combined ratings of 30% or higher.
              </p>
              <div className="field-grid three">
                <div className="field">
                  <label htmlFor="dependent-parents">Dependent parents</label>
                  <select
                    id="dependent-parents"
                    value={dependents.parents}
                    onChange={(event) => updateCount('parents', event.target.value)}
                  >
                    <option value="0">None</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="children-under-18">Children under 18</label>
                  <input
                    id="children-under-18"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="20"
                    value={dependents.childrenUnder18}
                    onChange={(event) => updateCount('childrenUnder18', event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="school-children">Schoolchildren over 18</label>
                  <input
                    id="school-children"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="20"
                    value={dependents.schoolChildrenOver18}
                    onChange={(event) => updateCount('schoolChildrenOver18', event.target.value)}
                  />
                </div>
              </div>
              <div className="stack rate-details">
                <label className="checkbox" htmlFor="has-spouse">
                  <input
                    id="has-spouse"
                    type="checkbox"
                    checked={dependents.spouse}
                    onChange={(event) => {
                      setDependents((current) => ({
                        ...current,
                        spouse: event.target.checked,
                        spouseAidAndAttendance: event.target.checked
                          ? current.spouseAidAndAttendance
                          : false,
                      }));
                      setStatus('Dependent selection updated.');
                    }}
                  />
                  Include spouse
                </label>
                <label className="checkbox" htmlFor="spouse-aa">
                  <input
                    id="spouse-aa"
                    type="checkbox"
                    checked={dependents.spouseAidAndAttendance}
                    disabled={!dependents.spouse}
                    onChange={(event) => {
                      setDependents((current) => ({
                        ...current,
                        spouseAidAndAttendance: event.target.checked,
                      }));
                      setStatus('Dependent selection updated.');
                    }}
                  />
                  Spouse receives Aid and Attendance
                </label>
              </div>
            </section>
          </div>

          <section className="card result-card" aria-labelledby="result-title">
            <p className="eyebrow">Calculation summary</p>
            <h2 id="result-title">Estimated result</h2>
            <p className="print-only">VA Math Machine — independent educational estimate</p>

            {!estimate ? (
              <p>No estimate is available until at least one rating is added.</p>
            ) : (
              <>
                <div className="result-primary">
                  <div className="metric">
                    <span className="metric-label">Combined rating</span>
                    <span className="metric-value">{estimate.rating.finalRating}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Basic monthly estimate</span>
                    <span className="metric-value">
                      {estimate.compensation
                        ? money.format(estimate.compensation.totalCents / 100)
                        : 'Unavailable'}
                    </span>
                  </div>
                </div>

                <p>
                  Whole-person value before final rounding:{' '}
                  <strong>{estimate.rating.combinedValue}%</strong>
                </p>
                {estimate.rating.bilateralApplied && (
                  <p>
                    Bilateral treatment was applied because it produced the most favorable
                    schedular result. Bilateral addition:{' '}
                    <strong>{estimate.rating.bilateralAddition}%</strong>.
                  </p>
                )}

                <details className="rate-details">
                  <summary>Show rating calculation</summary>
                  <ol className="calculation">
                    {estimate.rating.steps.map((step, index) => (
                      <li key={`${index}-${step}`}>{step}</li>
                    ))}
                  </ol>
                </details>

                {estimate.compensation && (
                  <details className="rate-details">
                    <summary>Show compensation calculation</summary>
                    {estimate.compensation.lineItems.map((line) => (
                      <div className="rate-line" key={line.label}>
                        <span>{line.label}</span>
                        <strong>{money.format(line.amountCents / 100)}</strong>
                      </div>
                    ))}
                  </details>
                )}
              </>
            )}

            <div className="actions no-print">
              <button
                className="button secondary"
                type="button"
                disabled={!estimate}
                onClick={() => window.print()}
              >
                Print or save as PDF
              </button>
            </div>

            <p className="help">
              Printing or saving creates a document that may contain sensitive information.
              Shared computers, print queues, printers, saved files, and cloud destinations are
              outside this calculator's control.
            </p>
            <p className="help">
              Rates effective {RATE_METADATA.effectiveDate}; verified{' '}
              {RATE_METADATA.verifiedDate}. Next review: {RATE_METADATA.reviewDueDate}.
            </p>
            <ul className="source-list">
              <li>
                <a href="https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.25">
                  38 C.F.R. § 4.25
                </a>
              </li>
              <li>
                <a href="https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.26">
                  38 C.F.R. § 4.26
                </a>
              </li>
              <li>
                <a href={RATE_METADATA.sourceUrl}>Official VA compensation rates</a>
              </li>
            </ul>
            <p className="help">
              Excludes SMC, TDIU eligibility, offsets, apportionment, pension, survivor benefits,
              retroactive/effective-date decisions, and case-specific adjustments.
            </p>
          </section>
        </div>

        <div className="sr-status" aria-live="polite" aria-atomic="true">
          {status}
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>VA Math Machine v1.0.0 — independent, unofficial, and educational.</p>
          <p>
            Source code and issue reporting are available on{' '}
            <a href="https://github.com/BeeWadd/VA-Math-Machine">GitHub</a>.
          </p>
        </div>
      </footer>
    </>
  );
}
