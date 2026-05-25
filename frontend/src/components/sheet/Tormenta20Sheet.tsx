'use client';

import { useState, useCallback, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  T20Sheet, T20Atributo, T20Pericia, T20Ataque, T20Magia, T20Poder, T20Item,
  T20_ATRIBUTOS, T20_PERICIAS_META, T20_CLASSES, T20_RACAS, T20_ORIGENS,
  T20_GRADUACAO_LABELS, T20GraduacaoValor,
  modAtributo, fmtMod, bonusPericia, bonusResistencia, defaultT20Sheet,
} from './tormenta20-types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface T20SheetEditorProps {
  sheet: Record<string, unknown>;
  characterName: string;
  readOnly?: boolean;
  onSave?: (data: T20Sheet) => Promise<void>;
}

type Aba = 'atributos' | 'pericias' | 'combate' | 'magias' | 'poderes' | 'equipamento' | 'historia';

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Tormenta20Sheet({ sheet: raw, characterName, readOnly, onSave }: T20SheetEditorProps) {
  const initial = defaultT20Sheet(raw as Partial<T20Sheet>);
  return <Editor initial={initial} characterName={characterName} readOnly={readOnly} onSave={onSave} />;
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function Editor({
  initial, characterName, readOnly, onSave,
}: {
  initial: T20Sheet;
  characterName: string;
  readOnly?: boolean;
  onSave?: (s: T20Sheet) => Promise<void>;
}) {
  const [s, setS] = useState<T20Sheet>(initial);
  const [aba, setAba] = useState<Aba>('atributos');
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [deltaPv, setDeltaPv] = useState('');
  const [deltaPm, setDeltaPm] = useState('');

  const upd = useCallback(<K extends keyof T20Sheet>(key: K, val: T20Sheet[K]) => {
    setS(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  const updAtrib = (ab: T20Atributo, val: number) => {
    setS(prev => ({ ...prev, atributos: { ...prev.atributos, [ab]: val } }));
    setSaved(false);
  };

  const applyPv = (sign: 1 | -1) => {
    const n = parseInt(deltaPv, 10);
    if (isNaN(n)) return;
    setS(prev => ({ ...prev, pvAtual: Math.min(prev.pvMax, Math.max(0, prev.pvAtual + sign * n)) }));
    setDeltaPv('');
    setSaved(false);
  };

  const applyPm = (sign: 1 | -1) => {
    const n = parseInt(deltaPm, 10);
    if (isNaN(n)) return;
    setS(prev => ({ ...prev, pmAtual: Math.min(prev.pmMax, Math.max(0, prev.pmAtual + sign * n)) }));
    setDeltaPm('');
    setSaved(false);
  };

  const handleSave = () => {
    if (!onSave) return;
    startSave(async () => { await onSave(s); setSaved(true); });
  };

  const ABAS: Aba[] = ['atributos', 'pericias', 'combate', 'magias', 'poderes', 'equipamento', 'historia'];
  const ABA_ICONS: Record<Aba, string> = {
    atributos: '⚔️', pericias: '📜', combate: '🗡️',
    magias: '✨', poderes: '💪', equipamento: '🎒', historia: '📖',
  };

  const pvPct = s.pvMax > 0 ? Math.min(100, (s.pvAtual / s.pvMax) * 100) : 0;
  const pmPct = s.pmMax > 0 ? Math.min(100, (s.pmAtual / s.pmMax) * 100) : 0;
  const pvColor = pvPct > 50 ? 'bg-green-500' : pvPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-stone-950 text-stone-200 rounded-xl overflow-hidden border border-stone-800 min-h-full">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-stone-900 border-b border-stone-800 px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white">{characterName}</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {[s.raca, s.classe, s.origem].filter(Boolean).join(' · ')}
              {s.nivel ? ` · Nível ${s.nivel}` : ''}
              {s.divindade ? ` · ${s.divindade}` : ''}
            </p>
          </div>

          {/* PV + PM widgets */}
          <div className="flex flex-wrap items-center gap-3">

            {/* PV */}
            <div className="bg-stone-800 rounded-xl px-4 py-2 min-w-[160px]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] text-stone-500 uppercase tracking-widest">PV</span>
                <span className={`font-bold text-sm ${s.pvAtual === 0 ? 'text-red-500' : 'text-white'}`}>{s.pvAtual}</span>
                <span className="text-stone-600 text-xs">/ {s.pvMax}</span>
                {s.pvTemporario > 0 && <span className="text-blue-400 text-xs">(+{s.pvTemporario})</span>}
              </div>
              <div className="w-full bg-stone-700 rounded-full h-1.5 mb-1.5">
                <div className={`${pvColor} h-1.5 rounded-full transition-all`} style={{ width: `${pvPct}%` }} />
              </div>
              {!readOnly && (
                <div className="flex items-center gap-1">
                  <input value={deltaPv} onChange={e => setDeltaPv(e.target.value.replace(/\D/, ''))} placeholder="Δ"
                    className="w-10 bg-stone-700 rounded px-1 text-xs text-center" />
                  <button onClick={() => applyPv(-1)} className="text-red-400 hover:text-red-300 text-sm font-bold px-1">−</button>
                  <button onClick={() => applyPv(1)} className="text-green-400 hover:text-green-300 text-sm font-bold px-1">+</button>
                </div>
              )}
            </div>

            {/* PM */}
            {s.pmMax > 0 && (
              <div className="bg-stone-800 rounded-xl px-4 py-2 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest">PM</span>
                  <span className="font-bold text-sm text-blue-300">{s.pmAtual}</span>
                  <span className="text-stone-600 text-xs">/ {s.pmMax}</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-1.5 mb-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pmPct}%` }} />
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <input value={deltaPm} onChange={e => setDeltaPm(e.target.value.replace(/\D/, ''))} placeholder="Δ"
                      className="w-10 bg-stone-700 rounded px-1 text-xs text-center" />
                    <button onClick={() => applyPm(-1)} className="text-red-400 hover:text-red-300 text-sm font-bold px-1">−</button>
                    <button onClick={() => applyPm(1)} className="text-blue-400 hover:text-blue-300 text-sm font-bold px-1">+</button>
                  </div>
                )}
              </div>
            )}

            {/* Badges de combate rápido */}
            <div className="flex gap-2 flex-wrap">
              <StatBadge label="DEF" value={s.defesaOverride ?? s.defesa} />
              <StatBadge label="RD" value={s.reducaoDano} />
              <StatBadge label="Des" value={`${s.deslocamento}m`} />
            </div>

            {!readOnly && onSave && (
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition disabled:opacity-50">
                {saving ? 'Salvando…' : saved ? '✓ Salvo' : 'Salvar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Abas ────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-stone-800 bg-stone-900/50 overflow-x-auto">
        {ABAS.map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-4 py-2.5 text-xs font-medium capitalize whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              aba === a ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-500 hover:text-stone-300'
            }`}>
            <span>{ABA_ICONS[a]}</span> {a}
          </button>
        ))}
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <div className="p-5">
        {aba === 'atributos'   && <AbaAtributos   s={s} upd={upd} updAtrib={updAtrib} readOnly={readOnly} />}
        {aba === 'pericias'    && <AbaPericias     s={s} upd={upd} readOnly={readOnly} />}
        {aba === 'combate'     && <AbaCombate      s={s} upd={upd} readOnly={readOnly} />}
        {aba === 'magias'      && <AbaMagias       s={s} upd={upd} readOnly={readOnly} />}
        {aba === 'poderes'     && <AbaPoderes      s={s} upd={upd} readOnly={readOnly} />}
        {aba === 'equipamento' && <AbaEquipamento  s={s} upd={upd} readOnly={readOnly} />}
        {aba === 'historia'    && <AbaHistoria     s={s} upd={upd} readOnly={readOnly} />}
      </div>
    </div>
  );
}

// ─── Aba: Atributos ───────────────────────────────────────────────────────────

function AbaAtributos({ s, upd, updAtrib, readOnly }: {
  s: T20Sheet;
  upd: <K extends keyof T20Sheet>(k: K, v: T20Sheet[K]) => void;
  updAtrib: (ab: T20Atributo, v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Identidade */}
      <Section title="Identificação">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <SelectField label="Raça" value={s.raca} options={T20_RACAS} readOnly={readOnly} onChange={v => upd('raca', v)} />
          <SelectField label="Classe" value={s.classe} options={T20_CLASSES} readOnly={readOnly} onChange={v => upd('classe', v)} />
          <SelectField label="Origem" value={s.origem} options={T20_ORIGENS} readOnly={readOnly} onChange={v => upd('origem', v)} />
          <TextField label="Divindade" value={s.divindade ?? ''} readOnly={readOnly} onChange={v => upd('divindade', v)} />
          <TextField label="Alinhamento" value={s.alinhamento} readOnly={readOnly} onChange={v => upd('alinhamento', v)} />
          <NumField label="Nível" value={s.nivel} min={1} max={20} readOnly={readOnly} onChange={v => upd('nivel', v)} />
          <NumField label="Experiência" value={s.experiencia} readOnly={readOnly} onChange={v => upd('experiencia', v)} />
          <NumField label="Deslocamento (m)" value={s.deslocamento} readOnly={readOnly} onChange={v => upd('deslocamento', v)} />
          <SelectField label="Tamanho" value={s.tamanho}
            options={['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal']}
            readOnly={readOnly} onChange={v => upd('tamanho', v as any)} />
        </div>
      </Section>

      {/* Atributos */}
      <Section title="Atributos">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {T20_ATRIBUTOS.map(({ key, abrev }) => {
            const val = s.atributos[key];
            const mod = modAtributo(val);
            return (
              <div key={key} className="bg-stone-900 border border-stone-800 rounded-xl p-3 text-center flex flex-col items-center gap-1">
                <p className="text-[10px] uppercase tracking-widest text-stone-500">{abrev}</p>
                <p className="text-2xl font-bold text-amber-400">{fmtMod(mod)}</p>
                {readOnly
                  ? <p className="text-sm text-stone-300">{val}</p>
                  : <input type="number" min={1} max={30} value={val}
                      onChange={e => updAtrib(key, parseInt(e.target.value) || 10)}
                      className="w-14 bg-stone-800 rounded px-1 py-0.5 text-center text-sm" />
                }
              </div>
            );
          })}
        </div>
      </Section>

      {/* Testes de Resistência */}
      <Section title="Testes de Resistência">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['fortitude', 'reflexos', 'vontade'] as const).map(res => {
            const total = bonusResistencia(s, res);
            const r = s.resistencias[res];
            const LABELS = { fortitude: 'Fortitude', reflexos: 'Reflexos', vontade: 'Vontade' };
            const ATTR_LABELS: Record<T20Atributo, string> = { for: 'FOR', des: 'DES', con: 'CON', int: 'INT', sab: 'SAB', car: 'CAR' };
            return (
              <div key={res} className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{LABELS[res]}</p>
                  <p className="text-2xl font-bold text-amber-400">{fmtMod(total)}</p>
                </div>
                <div className="text-xs text-stone-500 space-y-1">
                  <p>Base: {ATTR_LABELS[r.atributoBase]} ({fmtMod(modAtributo(s.atributos[r.atributoBase]))})</p>
                </div>
                {!readOnly && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-stone-500 w-16">Bônus classe</label>
                      <input type="number" value={r.bonus}
                        onChange={e => upd('resistencias', {
                          ...s.resistencias,
                          [res]: { ...r, bonus: parseInt(e.target.value) || 0 },
                        })}
                        className="w-16 bg-stone-800 rounded px-2 py-0.5 text-xs text-center" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-stone-500 w-16">Override</label>
                      <input type="number" value={r.override ?? ''}
                        placeholder="auto"
                        onChange={e => upd('resistencias', {
                          ...s.resistencias,
                          [res]: { ...r, override: e.target.value ? parseInt(e.target.value) : undefined },
                        })}
                        className="w-16 bg-stone-800 rounded px-2 py-0.5 text-xs text-center placeholder:text-stone-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ─── Aba: Perícias ────────────────────────────────────────────────────────────

const GRAD_OPTIONS: { value: T20GraduacaoValor; label: string }[] = [
  { value: 0,  label: '0 — Destreinado' },
  { value: 2,  label: '2 — Treinado' },
  { value: 4,  label: '4 — Treinado+' },
  { value: 6,  label: '6 — Veterano' },
  { value: 8,  label: '8 — Veterano+' },
  { value: 10, label: '10 — Épico' },
];

function AbaPericias({ s, upd, readOnly }: {
  s: T20Sheet;
  upd: <K extends keyof T20Sheet>(k: K, v: T20Sheet[K]) => void;
  readOnly?: boolean;
}) {
  const ATTR_ABREV: Record<T20Atributo, string> = { for: 'FOR', des: 'DES', con: 'CON', int: 'INT', sab: 'SAB', car: 'CAR' };

  const setPericia = (p: T20Pericia, patch: Partial<T20Sheet['pericias'][T20Pericia]>) => {
    upd('pericias', { ...s.pericias, [p]: { ...s.pericias[p], ...patch } });
  };

  const pericias = Object.entries(T20_PERICIAS_META) as [T20Pericia, typeof T20_PERICIAS_META[T20Pericia]][];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <p className="text-xs text-stone-500">Bônus = Modificador de atributo + Graduação + Outros − Penalidades</p>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-stone-500 text-xs border-b border-stone-800 bg-stone-800/50">
              <th className="text-left px-4 py-2">Perícia</th>
              <th className="text-center px-2 py-2">Attr</th>
              <th className="text-center px-2 py-2">Grad</th>
              <th className="text-center px-2 py-2">Outros</th>
              <th className="text-center px-2 py-2">Pen.</th>
              <th className="text-center px-3 py-2 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {pericias.map(([key, meta]) => {
              const dado = s.pericias[key];
              const total = bonusPericia(s, key);
              const isST = meta.somenteTreinado && dado.graduacao === 0;
              return (
                <tr key={key} className={`border-b border-stone-800/50 ${isST ? 'opacity-40' : ''} hover:bg-stone-800/20 transition`}>
                  <td className="px-4 py-1.5">
                    <span className="font-medium">{meta.label}</span>
                    {meta.somenteTreinado && <span className="ml-1 text-[9px] text-amber-600 uppercase">ST</span>}
                  </td>
                  <td className="text-center px-2 py-1.5 text-stone-500 text-xs">
                    {ATTR_ABREV[dado.atributo]}
                    <span className="text-stone-600 ml-1">({fmtMod(modAtributo(s.atributos[dado.atributo]))})</span>
                  </td>
                  <td className="text-center px-2 py-1.5">
                    {readOnly
                      ? <span className="font-mono">{dado.graduacao}</span>
                      : (
                        <select value={dado.graduacao}
                          onChange={e => setPericia(key, { graduacao: parseInt(e.target.value) as T20GraduacaoValor })}
                          className="bg-stone-800 rounded px-1 py-0.5 text-xs text-center w-10">
                          {GRAD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
                        </select>
                      )
                    }
                  </td>
                  <td className="text-center px-2 py-1.5">
                    {readOnly
                      ? <span>{dado.bonus || '—'}</span>
                      : <input type="number" value={dado.bonus}
                          onChange={e => setPericia(key, { bonus: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-stone-800 rounded px-1 py-0.5 text-xs text-center" />
                    }
                  </td>
                  <td className="text-center px-2 py-1.5">
                    {readOnly
                      ? <span>{dado.penalidade || '—'}</span>
                      : <input type="number" value={dado.penalidade}
                          onChange={e => setPericia(key, { penalidade: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-stone-800 rounded px-1 py-0.5 text-xs text-center" />
                    }
                  </td>
                  <td className="text-center px-3 py-1.5 font-bold text-base">
                    {isST
                      ? <span className="text-stone-600 text-xs">—</span>
                      : <span className={`${total !== null && total >= 10 ? 'text-amber-400' : 'text-white'}`}>
                          {total !== null ? fmtMod(total) : '—'}
                        </span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Aba: Combate ─────────────────────────────────────────────────────────────

function AbaCombate({ s, upd, readOnly }: {
  s: T20Sheet;
  upd: <K extends keyof T20Sheet>(k: K, v: T20Sheet[K]) => void;
  readOnly?: boolean;
}) {
  const addAtaque = () => {
    const novo: T20Ataque = {
      id: uuidv4(), nome: 'Novo ataque', tipo: 'corpo-a-corpo',
      bonus: '+0', dano: '1d6', tipoDano: 'cortante', critico: '20/×2', alcance: '1,5m',
    };
    upd('ataques', [...s.ataques, novo]);
  };

  const updAtaque = (id: string, patch: Partial<T20Ataque>) =>
    upd('ataques', s.ataques.map(a => a.id === id ? { ...a, ...patch } : a));

  const remAtaque = (id: string) => upd('ataques', s.ataques.filter(a => a.id !== id));

  return (
    <div className="space-y-5">
      {/* Stats de combate */}
      <Section title="Estatísticas de Combate">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CombatStat label="PV Máximo"     value={s.pvMax}        readOnly={readOnly} onChange={v => upd('pvMax', v)} />
          <CombatStat label="PV Atual"      value={s.pvAtual}      readOnly={readOnly} onChange={v => upd('pvAtual', v)} />
          <CombatStat label="PV Temp."      value={s.pvTemporario} readOnly={readOnly} onChange={v => upd('pvTemporario', v)} />
          <CombatStat label="Defesa"        value={s.defesaOverride ?? s.defesa} readOnly={readOnly} onChange={v => upd('defesaOverride', v)} />
          <CombatStat label="RD"            value={s.reducaoDano}  readOnly={readOnly} onChange={v => upd('reducaoDano', v)} />
          <CombatStat label="PM Máximo"     value={s.pmMax}        readOnly={readOnly} onChange={v => upd('pmMax', v)} />
          <CombatStat label="PM Atual"      value={s.pmAtual}      readOnly={readOnly} onChange={v => upd('pmAtual', v)} />
          <CombatStat label="Dados restantes" value={s.dadosRestantes} readOnly={readOnly} onChange={v => upd('dadosRestantes', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-xs text-stone-500">Dado de vida</label>
            {readOnly
              ? <p className="text-lg font-bold mt-1">{s.dadoDeVida}</p>
              : <input value={s.dadoDeVida} onChange={e => upd('dadoDeVida', e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm mt-1" />
            }
          </div>
        </div>
      </Section>

      {/* Ataques */}
      <Section title="Ataques">
        {!readOnly && (
          <button onClick={addAtaque} className="mb-3 text-xs text-amber-400 hover:text-amber-300">+ Adicionar ataque</button>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-stone-500 border-b border-stone-800">
                <th className="text-left pb-2 pr-2">Nome</th>
                <th className="text-center pb-2 px-1">Tipo</th>
                <th className="text-center pb-2 px-1">Bônus</th>
                <th className="text-center pb-2 px-1">Dano</th>
                <th className="text-left pb-2 px-1">Tipo dano</th>
                <th className="text-center pb-2 px-1">Crítico</th>
                <th className="text-left pb-2 px-1">Alcance</th>
                {!readOnly && <th className="pb-2 w-5" />}
              </tr>
            </thead>
            <tbody>
              {s.ataques.map(atk => (
                <tr key={atk.id} className="border-b border-stone-800/40">
                  {readOnly ? (
                    <>
                      <td className="py-1.5 pr-2 font-medium">{atk.nome}</td>
                      <td className="py-1.5 px-1 text-center text-stone-400">{atk.tipo.replace('corpo-a-corpo', 'C/C').replace('distancia', 'Dist').replace('magia', 'Mag')}</td>
                      <td className="py-1.5 px-1 text-center text-amber-400 font-mono">{atk.bonus}</td>
                      <td className="py-1.5 px-1 text-center font-mono">{atk.dano}</td>
                      <td className="py-1.5 px-1 text-stone-400">{atk.tipoDano}</td>
                      <td className="py-1.5 px-1 text-center">{atk.critico}</td>
                      <td className="py-1.5 px-1 text-stone-400">{atk.alcance}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-1 pr-1"><input value={atk.nome} onChange={e => updAtaque(atk.id, { nome: e.target.value })} className="w-full bg-stone-800 rounded px-2 py-0.5" /></td>
                      <td className="py-1 px-1">
                        <select value={atk.tipo} onChange={e => updAtaque(atk.id, { tipo: e.target.value as any })} className="bg-stone-800 rounded px-1 py-0.5 text-[10px]">
                          <option value="corpo-a-corpo">C/C</option>
                          <option value="distancia">Dist</option>
                          <option value="magia">Mag</option>
                        </select>
                      </td>
                      <td className="py-1 px-1"><input value={atk.bonus} onChange={e => updAtaque(atk.id, { bonus: e.target.value })} className="w-12 bg-stone-800 rounded px-1 py-0.5 text-center" /></td>
                      <td className="py-1 px-1"><input value={atk.dano} onChange={e => updAtaque(atk.id, { dano: e.target.value })} className="w-16 bg-stone-800 rounded px-1 py-0.5 text-center" /></td>
                      <td className="py-1 px-1"><input value={atk.tipoDano} onChange={e => updAtaque(atk.id, { tipoDano: e.target.value })} className="w-20 bg-stone-800 rounded px-1 py-0.5" /></td>
                      <td className="py-1 px-1"><input value={atk.critico} onChange={e => updAtaque(atk.id, { critico: e.target.value })} className="w-16 bg-stone-800 rounded px-1 py-0.5 text-center" /></td>
                      <td className="py-1 px-1"><input value={atk.alcance} onChange={e => updAtaque(atk.id, { alcance: e.target.value })} className="w-16 bg-stone-800 rounded px-1 py-0.5" /></td>
                      <td className="py-1 pl-1"><button onClick={() => remAtaque(atk.id)} className="text-red-500 hover:text-red-400">✕</button></td>
                    </>
                  )}
                </tr>
              ))}
              {s.ataques.length === 0 && (
                <tr><td colSpan={8} className="py-4 text-center text-stone-600 italic">Nenhum ataque cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ─── Aba: Magias ──────────────────────────────────────────────────────────────

function AbaMagias({ s, upd, readOnly }: {
  s: T20Sheet;
  upd: <K extends keyof T20Sheet>(k: K, v: T20Sheet[K]) => void;
  readOnly?: boolean;
}) {
  const addMagia = () => {
    const nova: T20Magia = {
      id: uuidv4(), nome: 'Nova magia', circulo: 1, escola: 'Transmutação',
      execucao: 'padrão', alcance: '9m', alvo: '1 criatura', duracao: 'instantânea',
      resistencia: '—', custopm: 1, preparada: false,
    };
    upd('magias', [...s.magias, nova]);
  };

  const updMagia = (id: string, patch: Partial<T20Magia>) =>
    upd('magias', s.magias.map(m => m.id === id ? { ...m, ...patch } : m));

  const remMagia = (id: string) => upd('magias', s.magias.filter(m => m.id !== id));

  const circulos = Array.from(new Set(s.magias.map(m => m.circulo))).sort();

  return (
    <div className="space-y-4">
      <Section title="Pontos de Mana">
        <div className="grid grid-cols-3 gap-3">
          <CombatStat label="PM Máximo" value={s.pmMax} readOnly={readOnly} onChange={v => upd('pmMax', v)} />
          <CombatStat label="PM Atual"  value={s.pmAtual} readOnly={readOnly} onChange={v => upd('pmAtual', v)} />
          <CombatStat label="Círculo máximo" value={s.circulosConhecidos} readOnly={readOnly} onChange={v => upd('circulosConhecidos', v)} />
        </div>
      </Section>

      <Section title="Lista de Magias">
        {!readOnly && (
          <button onClick={addMagia} className="mb-3 text-xs text-amber-400 hover:text-amber-300">+ Adicionar magia</button>
        )}
        {s.magias.length === 0 && <p className="text-stone-600 italic text-xs">Nenhuma magia cadastrada.</p>}
        {circulos.map(circ => (
          <div key={circ} className="mb-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              {circ === 0 ? 'Truque / Oratória' : `${circ}º Círculo`}
            </p>
            {s.magias.filter(m => m.circulo === circ).map(magia => (
              <div key={magia.id} className="bg-stone-900 border border-stone-800 rounded-xl p-3 mb-2 space-y-2">
                <div className="flex items-start gap-2">
                  {!readOnly && (
                    <input type="checkbox" checked={magia.preparada}
                      onChange={e => updMagia(magia.id, { preparada: e.target.checked })}
                      className="accent-amber-400 mt-0.5" />
                  )}
                  {readOnly && (
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${magia.preparada ? 'bg-amber-400' : 'bg-stone-700'}`} />
                  )}
                  <div className="flex-1 space-y-2">
                    {readOnly ? (
                      <div>
                        <p className="font-semibold text-sm text-white">{magia.nome}
                          <span className="text-stone-500 font-normal text-xs ml-2">({magia.escola}) · {magia.custopm} PM</span>
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {magia.execucao} · {magia.alcance} · {magia.duracao} · Res: {magia.resistencia}
                        </p>
                        {magia.descricao && <p className="text-xs text-stone-300 mt-1">{magia.descricao}</p>}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <input value={magia.nome} onChange={e => updMagia(magia.id, { nome: e.target.value })} placeholder="Nome" className="col-span-2 bg-stone-800 rounded px-2 py-1 text-sm font-medium" />
                        <input value={magia.escola} onChange={e => updMagia(magia.id, { escola: e.target.value })} placeholder="Escola" className="bg-stone-800 rounded px-2 py-1 text-xs" />
                        <input type="number" value={magia.custopm} onChange={e => updMagia(magia.id, { custopm: parseInt(e.target.value) || 0 })} placeholder="Custo PM" className="bg-stone-800 rounded px-2 py-1 text-xs" />
                        <input value={magia.execucao} onChange={e => updMagia(magia.id, { execucao: e.target.value })} placeholder="Execução" className="bg-stone-800 rounded px-2 py-1 text-xs" />
                        <input value={magia.alcance} onChange={e => updMagia(magia.id, { alcance: e.target.value })} placeholder="Alcance" className="bg-stone-800 rounded px-2 py-1 text-xs" />
                        <input value={magia.alvo} onChange={e => updMagia(magia.id, { alvo: e.target.value })} placeholder="Alvo" className="bg-stone-800 rounded px-2 py-1 text-xs" />
                        <input value={magia.duracao} onChange={e => updMagia(magia.id, { duracao: e.target.value })} placeholder="Duração" className="bg-stone-800 rounded px-2 py-1 text-xs" />
                        <input value={magia.resistencia} onChange={e => updMagia(magia.id, { resistencia: e.target.value })} placeholder="Resistência" className="bg-stone-800 rounded px-2 py-1 text-xs" />
                        <textarea value={magia.descricao ?? ''} onChange={e => updMagia(magia.id, { descricao: e.target.value })} placeholder="Descrição…" rows={2} className="col-span-2 bg-stone-800 rounded px-2 py-1 text-xs resize-none" />
                      </div>
                    )}
                  </div>
                  {!readOnly && (
                    <button onClick={() => remMagia(magia.id)} className="text-red-500 hover:text-red-400 text-xs">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </Section>
    </div>
  );
}

// ─── Aba: Poderes ─────────────────────────────────────────────────────────────

function AbaPoderes({ s, upd, readOnly }: {
  s: T20Sheet;
  upd: <K extends keyof T20Sheet>(k: K, v: T20Sheet[K]) => void;
  readOnly?: boolean;
}) {
  const TIPOS = ['combate', 'magia', 'destino', 'tormenta', 'origem', 'classe', 'outro'] as const;
  const TIPO_CORES: Record<string, string> = {
    combate: 'text-red-400', magia: 'text-blue-400', destino: 'text-purple-400',
    tormenta: 'text-orange-400', origem: 'text-green-400', classe: 'text-amber-400', outro: 'text-stone-400',
  };

  const addPoder = () => {
    upd('poderes', [...s.poderes, { id: uuidv4(), nome: 'Novo poder', tipo: 'combate', descricao: '' }]);
  };

  const updPoder = (id: string, patch: Partial<T20Poder>) =>
    upd('poderes', s.poderes.map(p => p.id === id ? { ...p, ...patch } : p));

  const remPoder = (id: string) => upd('poderes', s.poderes.filter(p => p.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-400">{s.poderes.length} poder(es)</p>
        {!readOnly && <button onClick={addPoder} className="text-xs text-amber-400 hover:text-amber-300">+ Adicionar poder</button>}
      </div>

      {s.poderes.length === 0 && <p className="text-stone-600 italic text-xs">Nenhum poder cadastrado.</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {s.poderes.map(poder => (
          <div key={poder.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
            {readOnly ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-white">{poder.nome}</p>
                  <span className={`text-xs uppercase font-semibold ${TIPO_CORES[poder.tipo]}`}>{poder.tipo}</span>
                </div>
                {poder.prerequisito && <p className="text-xs text-stone-500">Pré: {poder.prerequisito}</p>}
                <p className="text-xs text-stone-300 leading-relaxed">{poder.descricao || <em className="text-stone-600">Sem descrição.</em>}</p>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <input value={poder.nome} onChange={e => updPoder(poder.id, { nome: e.target.value })}
                    className="flex-1 bg-stone-800 rounded px-2 py-1 text-sm font-medium" placeholder="Nome" />
                  <select value={poder.tipo} onChange={e => updPoder(poder.id, { tipo: e.target.value as any })}
                    className="bg-stone-800 rounded px-2 py-1 text-xs">
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => remPoder(poder.id)} className="text-red-500 hover:text-red-400 text-xs">✕</button>
                </div>
                <input value={poder.prerequisito ?? ''} onChange={e => updPoder(poder.id, { prerequisito: e.target.value })}
                  className="w-full bg-stone-800 rounded px-2 py-1 text-xs" placeholder="Pré-requisito (opcional)" />
                <textarea value={poder.descricao} onChange={e => updPoder(poder.id, { descricao: e.target.value })}
                  rows={3} className="w-full bg-stone-800 rounded px-2 py-1 text-xs resize-y" placeholder="Descrição do poder…" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Aba: Equipamento ─────────────────────────────────────────────────────────

function AbaEquipamento({ s, upd, readOnly }: {
  s: T20Sheet;
  upd: <K extends keyof T20Sheet>(k: K, v: T20Sheet[K]) => void;
  readOnly?: boolean;
}) {
  const addItem = () => upd('equipamentos', [...s.equipamentos, { id: uuidv4(), nome: 'Novo item', quantidade: 1 }]);
  const updItem = (id: string, patch: Partial<T20Item>) =>
    upd('equipamentos', s.equipamentos.map(i => i.id === id ? { ...i, ...patch } : i));
  const remItem = (id: string) => upd('equipamentos', s.equipamentos.filter(i => i.id !== id));

  const MOEDAS: { key: keyof T20Sheet['tinacoins']; label: string }[] = [
    { key: 'tp', label: 'TP' }, { key: 'to', label: 'TO' },
    { key: 'tprata', label: 'TPrata' }, { key: 'tpouro', label: 'Touro' }, { key: 'tl', label: 'TL' },
  ];

  return (
    <div className="space-y-5">
      {/* Tinacoins */}
      <Section title="Tinacoins">
        <div className="grid grid-cols-5 gap-2">
          {MOEDAS.map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className="text-[10px] text-stone-500 mb-1">{label}</p>
              {readOnly
                ? <p className="text-lg font-bold">{s.tinacoins[key]}</p>
                : <input type="number" min={0} value={s.tinacoins[key]}
                    onChange={e => upd('tinacoins', { ...s.tinacoins, [key]: parseInt(e.target.value) || 0 })}
                    className="w-full bg-stone-800 rounded px-1 py-1 text-sm text-center" />
              }
            </div>
          ))}
        </div>
      </Section>

      {/* Equipamentos */}
      <Section title="Equipamentos">
        {!readOnly && <button onClick={addItem} className="mb-3 text-xs text-amber-400 hover:text-amber-300">+ Adicionar item</button>}
        <div className="space-y-1.5">
          {s.equipamentos.map(item => (
            <div key={item.id} className="flex items-center gap-2 border-b border-stone-800/50 py-1.5 text-sm">
              {readOnly ? (
                <>
                  <span className="flex-1">{item.nome}</span>
                  <span className="text-stone-500 text-xs">×{item.quantidade}</span>
                  {item.peso && <span className="text-stone-600 text-xs">{item.peso}kg</span>}
                  {item.bonus && <span className="text-amber-400 text-xs">{item.bonus}</span>}
                  {item.notas && <span className="text-stone-500 text-xs">{item.notas}</span>}
                </>
              ) : (
                <>
                  <input value={item.nome} onChange={e => updItem(item.id, { nome: e.target.value })} className="flex-1 bg-stone-800 rounded px-2 py-0.5 text-sm" />
                  <input type="number" min={1} value={item.quantidade} onChange={e => updItem(item.id, { quantidade: parseInt(e.target.value) || 1 })} className="w-12 bg-stone-800 rounded px-1 py-0.5 text-center text-sm" />
                  <input value={item.bonus ?? ''} onChange={e => updItem(item.id, { bonus: e.target.value })} placeholder="bônus" className="w-16 bg-stone-800 rounded px-1 py-0.5 text-xs" />
                  <input value={item.notas ?? ''} onChange={e => updItem(item.id, { notas: e.target.value })} placeholder="notas" className="w-28 bg-stone-800 rounded px-1 py-0.5 text-xs" />
                  <button onClick={() => remItem(item.id)} className="text-red-500 hover:text-red-400">✕</button>
                </>
              )}
            </div>
          ))}
          {s.equipamentos.length === 0 && <p className="text-stone-600 italic text-xs">Nenhum item.</p>}
        </div>
      </Section>
    </div>
  );
}

// ─── Aba: História ────────────────────────────────────────────────────────────

function AbaHistoria({ s, upd, readOnly }: {
  s: T20Sheet;
  upd: <K extends keyof T20Sheet>(k: K, v: T20Sheet[K]) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Section title="Aparência Física">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(['idade', 'altura', 'peso', 'olhos', 'cabelo', 'pele'] as const).map(f => (
            <div key={f}>
              <label className="text-[10px] text-stone-500 uppercase tracking-widest capitalize">{f}</label>
              {readOnly
                ? <p className="text-sm mt-0.5">{(s as any)[f] || '—'}</p>
                : <input value={(s as any)[f] ?? ''} onChange={e => upd(f as any, e.target.value)}
                    className="w-full bg-stone-800 rounded-lg px-2 py-1.5 text-sm mt-0.5" />
              }
            </div>
          ))}
        </div>
      </Section>

      {([
        { key: 'personalidade', label: 'Personalidade', rows: 3 },
        { key: 'aparencia', label: 'Descrição física', rows: 3 },
        { key: 'historico', label: 'História / Backstory', rows: 8 },
        { key: 'anotacoes', label: 'Anotações / Aventuras', rows: 5 },
      ] as const).map(({ key, label, rows }) => (
        <Section key={key} title={label}>
          {readOnly
            ? <p className="text-sm text-stone-300 whitespace-pre-wrap">{(s as any)[key] || <em className="text-stone-600">Vazio.</em>}</p>
            : <textarea rows={rows} value={(s as any)[key] ?? ''}
                onChange={e => upd(key as any, e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm resize-y focus:border-amber-500 focus:outline-none" />
          }
        </Section>
      ))}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{title}</p>
      {children}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-stone-800 rounded-lg px-2.5 py-1.5 text-center">
      <p className="text-[9px] text-stone-500">{label}</p>
      <p className="text-sm font-bold text-white leading-tight">{value}</p>
    </div>
  );
}

function CombatStat({ label, value, readOnly, onChange }: { label: string; value: number; readOnly?: boolean; onChange: (v: number) => void }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 text-center">
      <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">{label}</p>
      {readOnly
        ? <p className="text-2xl font-bold">{value}</p>
        : <input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
            className="w-full bg-stone-800 rounded px-2 py-1 text-center text-xl font-bold" />
      }
    </div>
  );
}

function TextField({ label, value, readOnly, onChange }: { label: string; value: string; readOnly?: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-stone-500 uppercase tracking-widest">{label}</label>
      {readOnly
        ? <p className="text-sm mt-0.5">{value || '—'}</p>
        : <input value={value} onChange={e => onChange(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm mt-0.5 focus:border-amber-500 focus:outline-none" />
      }
    </div>
  );
}

function SelectField({ label, value, options, readOnly, onChange }: { label: string; value: string; options: string[]; readOnly?: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-stone-500 uppercase tracking-widest">{label}</label>
      {readOnly
        ? <p className="text-sm mt-0.5">{value || '—'}</p>
        : <select value={value} onChange={e => onChange(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm mt-0.5 focus:border-amber-500 focus:outline-none">
            <option value="">Selecionar…</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
      }
    </div>
  );
}

function NumField({ label, value, min, max, readOnly, onChange }: { label: string; value: number; min?: number; max?: number; readOnly?: boolean; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-[10px] text-stone-500 uppercase tracking-widest">{label}</label>
      {readOnly
        ? <p className="text-sm mt-0.5">{value}</p>
        : <input type="number" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm mt-0.5" />
      }
    </div>
  );
}
