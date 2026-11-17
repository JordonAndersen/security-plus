-- Security+ Practice Lab — tighten function exposure (from Supabase security advisor).
-- Trigger-only functions should never be callable through the API (/rest/v1/rpc/...).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.custom_questions_guard() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
-- Validation helper is only used by the guard trigger.
revoke execute on function public.validate_custom_question(text, jsonb) from public, anon, authenticated;
