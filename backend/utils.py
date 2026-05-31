def clean_string(value) -> str:
    if value is None:
        return ""
    return str(value).strip()
