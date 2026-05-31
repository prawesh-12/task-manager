from supabase import Client, create_client

from config import config


def get_supabase() -> Client:
    if not config.SUPABASE_URL or not config.SUPABASE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and a Supabase API key must be configured. "
            "Set SUPABASE_URL and SUPABASE_KEY."
        )

    try:
        return create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
    except Exception as exc:
        if "Invalid API key" in str(exc):
            raise RuntimeError(
                "Supabase rejected the configured API key. Set SUPABASE_KEY "
                "to a valid API key from the Supabase dashboard."
            ) from exc
        raise


supabase = get_supabase()
