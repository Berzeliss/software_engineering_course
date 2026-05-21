# Refactoring

I will be using my internship work to show my refactoring examples.

## Example 1

### Orginal Code
```python
async def discover_urls_for_profiles(
    self,
    icp_profiles: List[Dict[str, Any]],
    fallback_profile: Dict[str, Any] | None = None,
    max_results: int = 50,
    region: str = "",
) -> List[Dict[str, Any]]:

    profiles = [profile for profile in icp_profiles if isinstance(profile, dict)]
    normalized_region = self._normalize_region_value(region)

    combined: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    # Try tracked profiles first
    if profiles:
        for profile_index, profile in enumerate(profiles):
            queries = FundraisingService.build_queries_from_saved_icp(profile)

            if not queries:
                queries = FundraisingService.build_search_queries(
                    icp=FundraisingService.build_profile_from_saved_icp(profile),
                )

            if not queries:
                queries = ["ideal customer profile"]

            discovered: list[dict[str, Any]] = []
            per_query_limit = max(5, min(max_results, 20))

            effective_region = normalized_region or self._normalize_region_value(
                profile.get("location") or profile.get("regions") or ""
            )

            for query in queries:
                discovered.extend(
                    await self.scraper.search_query(
                        query,
                        max_results=per_query_limit,
                        region=effective_region,
                    )
                )

            discovered = self._apply_hard_filters(
                discovered,
                effective_region,
                strict_geo=False,
            )

            for item in discovered:
                item = dict(item)

                item["source_profile_index"] = profile_index
                item["source_profile_id"] = str(
                    profile.get("id")
                    or profile.get("name")
                    or profile.get("industry")
                    or ""
                ).strip()

                url = self._discovery_identity_url(item)

                if not url or url in seen_urls:
                    continue

                seen_urls.add(url)
                combined.append(item)

    return self._balance_across_sources(combined, max_results)
```

### Reasoning
I focused on implementing the fundraising discovery pipeline and getting it to work as fast as possible. This resulted in me expanding the method, which makes the function hard to maintain.
Main problems:
- Fails Single Responsibility Principle
- Difficult to find out which part is the problem in debugging
- Difficult to read

### Improvements
I refactored the code to make it more readable and maintainable.
Main changes/improvements:
- Split the function into smaller functions
- Easier to maintain
- Easier to find out which part is the problem in debugging
- Easier to read

### Refactored Code
```python
async def discover_urls_for_profiles(
    self,
    icp_profiles: List[Dict[str, Any]],
    fallback_profile: Dict[str, Any] | None = None,
    max_results: int = 50,
    region: str = "",
) -> List[Dict[str, Any]]:

    normalized_region = self._normalize_region_value(region)

    tracked_results = await self._discover_tracked_profiles(
        icp_profiles,
        normalized_region,
        max_results,
    )

    fallback_results = await self._discover_fallback_profile(
        fallback_profile,
        normalized_region,
        max_results,
    )

    combined = self._deduplicate_results(
        tracked_results + fallback_results
    )

    return self._balance_across_sources(combined, max_results)


async def _discover_tracked_profiles(
    self,
    profiles,
    normalized_region,
    max_results,
):
    results = []

    for profile_index, profile in enumerate(profiles):
        discovered = await self._search_profile(
            profile,
            normalized_region,
            max_results,
        )

        enriched = self._attach_source_metadata(
            discovered,
            profile,
            profile_index,
        )

        results.extend(enriched)

    return results


def _attach_source_metadata(
    self,
    items,
    profile,
    profile_index,
):
    enriched = []

    for item in items:
        item = dict(item)

        item["source_profile_index"] = profile_index
        item["source_profile_id"] = str(
            profile.get("id")
            or profile.get("name")
            or profile.get("industry")
            or ""
        ).strip()

        enriched.append(item)

    return enriched
```

## Example 2

### Orginal Code
```python
@classmethod
def _matches_region_filter(cls, row: dict[str, Any], region: str) -> bool:
    requested = cls._normalize_region_value(region).lower()

    if not requested or requested in {"global", "worldwide", "all"}:
        return True

    uk_requested = requested in {
        "uk",
        "u.k.",
        "united kingdom",
        "great britain",
        "britain",
        "england",
        "scotland",
        "wales",
        "northern ireland",
    }

    haystack = " ".join(
        [
            str(row.get("name") or ""),
            str(row.get("description") or ""),
            str(row.get("publisher_name") or ""),
            str(row.get("query") or ""),
            str(row.get("website_url") or ""),
            str(row.get("publisher_url") or ""),
        ]
    ).lower()

    if uk_requested:
        return (
            "uk" in haystack
            or "united kingdom" in haystack
            or any(tld in haystack for tld in cls._EUROPE_TLDS)
            or any(marker in haystack for marker in cls._EUROPE_MARKERS)
        )

    if any(token in requested for token in ("europe", "eu", "european")):
        if any(marker in haystack for marker in cls._USA_MARKERS):
            return False

        return (
            any(marker in haystack for marker in cls._EUROPE_MARKERS)
            or any(tld in haystack for tld in cls._EUROPE_TLDS)
        )

    region_tokens = [
        token.strip()
        for token in re.split(r"[,/|]", requested)
        if token.strip()
    ]

    if not region_tokens:
        return True

    return any(token in haystack for token in region_tokens)
```

### Reasoning
The first code wasn't universal and only had a few country checks.
Main problems:
- Hardcoded Geo filters
- Difficult testing
- Large chains

### Improvements
I refactored the code by splitting it into smaller help methods.
Main changes/improvements:
- Reduced Complexity
- Easier to test
- Easier to read

### Refactored Code
```python
@classmethod
def _matches_region_filter(cls, row, region):
    requested = cls._normalize_region_value(region).lower()

    if cls._is_global_request(requested):
        return True

    haystack = cls._build_region_haystack(row)

    if cls._is_uk_request(requested):
        return cls._matches_uk_region(haystack)

    if cls._is_europe_request(requested):
        return cls._matches_europe_region(haystack)

    return cls._matches_generic_region(
        haystack,
        requested,
    )


@staticmethod
def _is_global_request(requested: str) -> bool:
    return requested in {"", "global", "worldwide", "all"}


@staticmethod
def _build_region_haystack(row: dict[str, Any]) -> str:
    return " ".join(
        [
            str(row.get("name") or ""),
            str(row.get("description") or ""),
            str(row.get("publisher_name") or ""),
            str(row.get("query") or ""),
        ]
    ).lower()


@classmethod
def _matches_uk_region(cls, haystack: str) -> bool:
    return (
        "uk" in haystack
        or "united kingdom" in haystack
        or any(tld in haystack for tld in cls._EUROPE_TLDS)
    )


@classmethod
def _matches_europe_region(cls, haystack: str) -> bool:
    if any(marker in haystack for marker in cls._USA_MARKERS):
        return False

    return (
        any(marker in haystack for marker in cls._EUROPE_MARKERS)
        or any(tld in haystack for tld in cls._EUROPE_TLDS)
    )
```