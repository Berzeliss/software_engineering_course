# Testing
I will use testing files i have done for my internship.

## Part A

### NON-AI test file

This unit test verifies that the FeedbackProcessor correctly transforms raw external feedback data (from Reddit via Apify) into structured FeedbackSignal objects. It checks proper field mapping (text, source, URL, competitor ID) and validates that sentiment analysis produces a negative score based on textual content. This ensures the correctness of the data processing pipeline independent of external systems.

```python
"""
Test Feedback Processor (Multi-source support)
"""
import pytest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../")))

from datetime import datetime
from app.domains.signal.models import RawAPILog, FeedbackSignal
from app.domains.signal.processors.feedback_processor import FeedbackProcessor

def test_feedback_processor_reddit():
    """
    Verify Apify Reddit raw data is correctly mapped to FeedbackSignal.
    Sentiment is now analyzed using VADER on title + content (not upvote score).
    """
    raw_data = {
        "items": [
            {
                "title": "Stripe sucks now",
                "body": "I hate the new dashboard.",
                "url": "https://reddit.com/r/SaaS/comments/123",
                "score": 10,
                "author": "dev_hater",
                "createdAt": "2024-01-01T10:00:00.000Z",
                "subreddit": "SaaS"
            }
        ],
        "run": {"status": "SUCCEEDED"}
    }
    
    log = RawAPILog(
        org_id="org-1",
        provider="apify-reddit",
        endpoint="actor-run-dataset",
        params={"q": "Stripe", "competitor_name": "Stripe"},
        response_data=raw_data,
        status_code=200,
        created_at=datetime.now()
    )
    
    processor = FeedbackProcessor()
    signals = processor.process(log, competitor_id="comp-1")
    
    assert len(signals) == 1
    signal = signals[0]
    
    assert isinstance(signal, FeedbackSignal)
    assert signal.text == "Stripe sucks now\n\nI hate the new dashboard."
    assert signal.source == "Reddit (r/SaaS)"
    assert signal.url == "https://reddit.com/r/SaaS/comments/123"
    # Sentiment should be NEGATIVE (due to "sucks" and "hate")
    assert signal.sentiment_score < -0.3, f"Expected negative sentiment, got {signal.sentiment_score}"
    assert signal.competitor_id == "comp-1"

def test_feedback_processor_trustpilot():
    """
    Verify Trustpilot data is correctly parsed and mapped to FeedbackSignal.
    5-star rating is scaled to +1.0 sentiment.
    """
    raw_data = {
        "items": [
            {
                "title": "Excellent service",
                "text": "Great customer support and easy to use.",
                "url": "https://www.trustpilot.com/reviews/...",
                "rating": 5,
                "date": "2024-01-15",
                "reviewer": "happy_customer"
            }
        ],
        "run": {"status": "SUCCEEDED"}
    }
    
    log = RawAPILog(
        org_id="org-1",
        provider="apify-trustpilot",
        endpoint="actor-run-dataset",
        params={"company": "Stripe"},
        response_data=raw_data,
        status_code=200,
        created_at=datetime.now()
    )
    
    processor = FeedbackProcessor()
    signals = processor.process(log, competitor_id="comp-1")
    
    assert len(signals) == 1
    signal = signals[0]
    
    assert signal.source == "Trustpilot"
    assert "Excellent service" in signal.text
    assert "Great customer support" in signal.text
    # 5 stars scaled: (5 - 3) * 0.5 = +1.0
    assert signal.sentiment_score == 1.0
```

### AI test file
This test suite validates the AI gateway orchestration layer, including provider selection based on intent, retry logic for failed LLM calls, fallback across multiple AI providers, cooldown handling for rate limits, and aggregation of routing metrics. External AI calls are mocked to ensure deterministic testing of routing and resilience logic without relying on real API calls.

```python
import asyncio

import pytest

from app.domains.ai.models import LLMResponse
from app.domains.ai import gateway


@pytest.mark.parametrize(
    "intent,expected_first",
    [
        ("generic_analysis", gateway.ProviderAttempt("openai", "gpt-4o-mini")),
        (
            "high_volume_classification",
            gateway.ProviderAttempt("gemini", "gemini-2.5-flash"),
        ),
        (
            "deep_reasoning_icp",
            gateway.ProviderAttempt("gemini", "gemini-2.5-pro"),
        ),
        (
            "outreach_copy",
            gateway.ProviderAttempt("groq", "llama-3.3-70b-versatile"),
        ),
    ],
)
def test_resolve_attempt_chain_by_intent(intent, expected_first) -> None:
    chain = gateway._resolve_attempt_chain(model=None, intent=intent)

    assert chain[0] == expected_first


def test_resolve_attempt_chain_prepends_explicit_model() -> None:
    chain = gateway._resolve_attempt_chain(
        model="gpt-4.1-mini",
        intent="high_volume_classification",
    )

    assert chain[0] == gateway.ProviderAttempt("openai", "gpt-4.1-mini")


def test_llm_gateway_retries_until_success(monkeypatch) -> None:
    attempted: list[gateway.ProviderAttempt] = []

    async def fake_run_provider_attempt(
        attempt: gateway.ProviderAttempt,
        messages,
        temperature,
        max_tokens,
        response_format,
    ) -> LLMResponse:
        attempted.append(attempt)
        if len(attempted) < 3:
            raise RuntimeError("rate limit")
        return LLMResponse(
            content="ok",
            model=attempt.model,
            provider=attempt.provider,
            finish_reason=None,
        )

    monkeypatch.setattr(gateway, "_provider_available", lambda provider, settings: True)
    monkeypatch.setattr(gateway, "_run_provider_attempt", fake_run_provider_attempt)
    monkeypatch.setattr(gateway, "_is_retryable_provider_error", lambda provider, exc: True)

    response = asyncio.run(
        gateway.llm_gateway(
            messages=[{"role": "user", "content": "hello"}],
            model=None,
            intent="high_volume_classification",
        )
    )

    assert response.content == "ok"
    assert attempted[:3] == [
        gateway.ProviderAttempt("gemini", "gemini-2.5-flash"),
        gateway.ProviderAttempt("cerebras", "llama-3.3-70b"),
        gateway.ProviderAttempt("sambanova", "Meta-Llama-3.3-70B-Instruct"),
    ]


def test_llm_gateway_stops_on_terminal_error(monkeypatch) -> None:
    attempts = {"count": 0}

    async def fake_run_provider_attempt(
        attempt: gateway.ProviderAttempt,
        messages,
        temperature,
        max_tokens,
        response_format,
    ) -> LLMResponse:
        attempts["count"] += 1
        raise RuntimeError("bad request")

    monkeypatch.setattr(gateway, "_provider_available", lambda provider, settings: True)
    monkeypatch.setattr(gateway, "_run_provider_attempt", fake_run_provider_attempt)
    monkeypatch.setattr(gateway, "_is_retryable_provider_error", lambda provider, exc: False)

    with pytest.raises(RuntimeError, match="bad request"):
        asyncio.run(
            gateway.llm_gateway(
                messages=[{"role": "user", "content": "hello"}],
                intent="generic_analysis",
            )
        )

    assert attempts["count"] == 1


def test_parse_retry_after_seconds_supports_seconds_and_minutes() -> None:
    seconds = gateway._parse_retry_after_seconds(RuntimeError("Please retry in 33.4s"))
    minutes = gateway._parse_retry_after_seconds(RuntimeError("Please try again in 49m38.208s"))

    assert seconds is not None
    assert 33.0 <= seconds <= 34.0
    assert minutes is not None
    assert minutes > 2900


def test_mark_attempt_cooldown_sets_active_window() -> None:
    attempt = gateway.ProviderAttempt("gemini", "gemini-2.5-flash")
    gateway._ATTEMPT_COOLDOWN_UNTIL.pop(attempt, None)

    gateway._mark_attempt_cooldown(
        attempt,
        RuntimeError("429 RESOURCE_EXHAUSTED. Please retry in 11s"),
    )

    assert gateway._attempt_in_cooldown(attempt) is True


def test_mark_attempt_cooldown_does_not_shorten_existing_window() -> None:
    attempt = gateway.ProviderAttempt("groq", "llama-3.3-70b-versatile")
    gateway._ATTEMPT_COOLDOWN_UNTIL.pop(attempt, None)

    gateway._mark_attempt_cooldown(
        attempt,
        RuntimeError("try again in 30s"),
    )
    first_until = gateway._ATTEMPT_COOLDOWN_UNTIL[attempt]

    gateway._mark_attempt_cooldown(
        attempt,
        RuntimeError("retry in 2s"),
    )
    second_until = gateway._ATTEMPT_COOLDOWN_UNTIL[attempt]

    assert second_until >= first_until


def test_record_routing_metrics_aggregates_by_intent() -> None:
    intent = "outreach_copy"
    gateway._ROUTING_METRICS.pop(intent, None)

    gateway._record_routing_metrics(intent, {"requests": 1, "attempts": 2, "cooldown_skips": 1})
    gateway._record_routing_metrics(intent, {"success": 1, "provider_gemini": 1})

    bucket = gateway._ROUTING_METRICS[intent]
    assert bucket["requests"] == 1
    assert bucket["attempts"] == 2
    assert bucket["cooldown_skips"] == 1
    assert bucket["success"] == 1
    assert bucket["provider_gemini"] == 1
```

## Part B
***Test Strategy: Mocking***

Mocking was used to simulate external AI provider behavior and ensure deterministic unit testing. Real API calls to LLM providers (such as OpenAI, Gemini, and Groq) were replaced with mocked functions using `monkeypatch`. This allows the AI system to be tested in isolation without relying on external services.

This approach was used to test key parts of the AI gateway logic, including provider selection, retry mechanisms, fallback behavior, and error handling. Different scenarios such as rate limits, successful responses, and terminal failures were simulated through mocked functions.

In the test suite, the following elements were mocked:
- LLM provider execution (`_run_provider_attempt`)
- Provider availability checks (`_provider_available`)
- Retry decision logic (`_is_retryable_provider_error`)
- Controlled failure scenarios using exceptions (`RuntimeError`)

These mocks enabled full control over AI system behavior during testing, allowing validation of complex routing and resilience logic without making real API calls.

This approach provides several benefits:
- Tests are fast and independent of external APIs
- Results are deterministic and reproducible
- Edge cases such as API failures and rate limits can be simulated reliably
- CI/CD pipeline compatibility is ensured

Overall, mocking was essential for validating the AI gateway system, as it allowed safe and controlled testing of provider routing, retry logic, and fallback mechanisms.