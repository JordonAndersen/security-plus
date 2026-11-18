-- Optional SY0-701 exam objective on user-created questions, stored in data->>'obj' (e.g. "2.4").
-- When present it must be a real objective AND belong to the question's own domain.
alter table public.custom_questions drop constraint if exists custom_questions_obj_valid;
alter table public.custom_questions add constraint custom_questions_obj_valid check (
  data->>'obj' is null
  or (
    data->>'obj' in ('1.1','1.2','1.3','1.4','2.1','2.2','2.3','2.4','2.5','3.1','3.2','3.3','3.4',
                     '4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9','5.1','5.2','5.3','5.4','5.5','5.6')
    and left(data->>'obj', 1)::int = domain
  )
);
