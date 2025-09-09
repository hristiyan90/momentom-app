-- Sessions keyset indexes (safe / idempotent)
create index if not exists sessions_ath_date_id_idx
  on public.sessions (athlete_id, date, session_id);

create index if not exists sessions_ath_sport_date_id_idx
  on public.sessions (athlete_id, sport, date, session_id);
