-- Security+ Practice Lab — fix for 0003.
-- custom_questions_guard (a SECURITY INVOKER trigger) calls validate_custom_question as the signed-in user,
-- so authenticated users need EXECUTE on it. It is a pure validation function with no side effects.
grant execute on function public.validate_custom_question(text, jsonb) to authenticated;
