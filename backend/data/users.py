from supabase_client import supabase


def list_users() -> list[dict]:
    response = (
        supabase.table("users")
        .select("id,email,name,avatar_url")
        .order("name")
        .execute()
    )
    return response.data


def get_user(user_id: str) -> dict | None:
    response = (
        supabase.table("users")
        .select("id,email,name,avatar_url")
        .eq("id", user_id)
        .execute()
    )
    return response.data[0] if response.data else None


def upsert_user(profile: dict) -> dict:
    response = (
        supabase.table("users")
        .upsert(profile, on_conflict="google_id")
        .execute()
    )

    if response.data:
        return response.data[0]

    fallback = (
        supabase.table("users")
        .select("*")
        .eq("google_id", profile["google_id"])
        .execute()
    )
    return fallback.data[0]
