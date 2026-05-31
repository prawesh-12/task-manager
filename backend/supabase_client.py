from supabase import Client, create_client

from config import config


def get_supabase() -> Client:
    if not config.SUPABASE_URL or not config.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured")

    return create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)


supabase = get_supabase()
