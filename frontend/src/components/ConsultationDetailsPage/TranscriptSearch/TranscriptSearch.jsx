import { useEffect, useRef, useState } from "react";
import {
    CircleAlert,
    FileSearch2,
    LoaderCircle,
    Search,
    Sparkles,
} from "lucide-react";

import { searchTranscript } from "../../../services/transcriptService";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import TranscriptSearchResult from "../TranscriptSearchResult/TranscriptSearchResult";

import styles from "./TranscriptSearch.module.css";

const MINIMUM_QUERY_LENGTH = 2;

function TranscriptSearch({
    consultationId,
    activeSegmentId,
    onResultSelect,
}) {
    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const requestControllerRef = useRef(null);

    useEffect(() => {
        return () => requestControllerRef.current?.abort();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        const normalizedQuery = query.trim();

        if (normalizedQuery.length < MINIMUM_QUERY_LENGTH) {
            setValidationError("Enter at least two characters to search.");
            return;
        }

        requestControllerRef.current?.abort();
        const controller = new AbortController();
        requestControllerRef.current = controller;

        setValidationError(null);
        setError(null);
        setStatus("loading");
        setSubmittedQuery(normalizedQuery);

        try {
            const data = await searchTranscript(
                consultationId,
                normalizedQuery,
                controller.signal
            );

            setResults(Array.isArray(data) ? data : []);
            setStatus("succeeded");
        } catch (requestError) {
            if (requestError?.code === "ERR_CANCELED") {
                return;
            }

            setResults([]);
            setError(getErrorMessage(requestError));
            setStatus("failed");
        }
    }

    function handleQueryChange(event) {
        setQuery(event.target.value);

        if (validationError) {
            setValidationError(null);
        }
    }

    const isLoading = status === "loading";
    const hasResults = status === "succeeded" && results.length > 0;
    const hasNoResults = status === "succeeded" && results.length === 0;

    return (
        <section className={styles.card} aria-labelledby="transcript-search-title">
            <div className={styles.cardHeader}>
                <span className={styles.headerIcon}>
                    <FileSearch2 size={18} />
                </span>
                <div>
                    <h3 id="transcript-search-title">Search the consultation</h3>
                    <p>Find symptoms, medications, dosage instructions, or decisions.</p>
                </div>
            </div>

            <form className={styles.searchForm} onSubmit={handleSubmit} noValidate>
                <label htmlFor="consultation-search">Search transcript</label>

                <div
                    className={`${styles.searchBox} ${
                        validationError ? styles.searchBoxInvalid : ""
                    }`}
                >
                    <Search size={18} aria-hidden="true" />
                    <input
                        id="consultation-search"
                        type="search"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="e.g. chest pain, dosage, follow-up"
                        autoComplete="off"
                        aria-describedby={
                            validationError ? "consultation-search-error" : undefined
                        }
                        aria-invalid={Boolean(validationError)}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <LoaderCircle size={17} className={styles.spinning} />
                        ) : (
                            <Search size={17} />
                        )}
                        <span>{isLoading ? "Searching" : "Search"}</span>
                    </button>
                </div>

                {validationError && (
                    <span
                        id="consultation-search-error"
                        className={styles.validationError}
                        role="alert"
                    >
                        {validationError}
                    </span>
                )}
            </form>

            <div className={styles.resultsArea} aria-live="polite">
                {status === "idle" && (
                    <div className={styles.initialState}>
                        <span>
                            <Sparkles size={22} />
                        </span>
                        <h4>Search for a clinical moment</h4>
                        <p>
                            Results include the matching transcript text and the exact
                            timestamp in the video.
                        </p>
                    </div>
                )}

                {isLoading && (
                    <div className={styles.loadingState} role="status">
                        <LoaderCircle size={24} className={styles.spinning} />
                        <strong>Searching indexed segments…</strong>
                        <span>This usually takes only a moment.</span>
                    </div>
                )}

                {status === "failed" && (
                    <div className={styles.errorState} role="alert">
                        <CircleAlert size={21} />
                        <div>
                            <strong>Search could not be completed</strong>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {hasNoResults && (
                    <div className={styles.emptyState}>
                        <span>
                            <Search size={22} />
                        </span>
                        <h4>No matching moments found</h4>
                        <p>
                            Try a shorter phrase or a related clinical term instead of “
                            {submittedQuery}”.
                        </p>
                    </div>
                )}

                {hasResults && (
                    <div className={styles.resultsList}>
                        <div className={styles.resultsSummary}>
                            <strong>
                                {results.length} {results.length === 1 ? "match" : "matches"}
                            </strong>
                            <span>for “{submittedQuery}”</span>
                        </div>

                        <div className={styles.resultCards}>
                            {results.map((result) => (
                                <TranscriptSearchResult
                                    key={result.id}
                                    result={result}
                                    isActive={activeSegmentId === result.id}
                                    onSelect={() => onResultSelect(result)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default TranscriptSearch;
