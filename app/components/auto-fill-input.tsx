"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import styles from "./styles.module.css";

export const AutoFillInput = () => {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const noFetchRef = useRef<boolean>(false);

  const showSuggestions = Boolean(suggestions) && !loading && !error;

  const fetchSuggestions = async (search: string) => {
    try {
      setError("");
      setSuggestions(null);
      setLoading(true);
      const res = await fetch(`/api/suggestions?search=${search}`);
      const data = await res.json();

      setSuggestions(data.suggestions);
      setQuery(search);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search || noFetchRef.current) {
      setSuggestions(null);
      return;
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => fetchSuggestions(search), 250);
  }, [search]);

  const getSuggestionEl = (suggestion: string): (string | { query: string })[] => {
    const indexOf = suggestion.toLowerCase().indexOf(query.toLowerCase());
    const initTxt = suggestion.slice(indexOf, indexOf + query.length);

    const splitted: (string | { query: string })[] = suggestion.split("");
    splitted.splice(indexOf, query.length, { query: initTxt });
    return splitted;
  };

  const selectSuggestion = (suggestion: string) => {
    noFetchRef.current = true;
    setSearch(suggestion);
  };

  const onChangeInput = (value: string) => {
    if (noFetchRef.current) {
      noFetchRef.current = false;
    }
    setSearch(value);
  };

  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        value={search}
        onChange={({ target: { value } }) => onChangeInput(value)}
        placeholder="Search for country"
      />
      {loading && (
        <div className={styles.suggestions}>
          <div className={styles.loading}>Loading...</div>
        </div>
      )}
      {error && (
        <div className={styles.suggestions}>
          <div className={styles.error}>Failed to get countries</div>
        </div>
      )}
      {showSuggestions && (
        <>
          {suggestions?.length ? (
            <div className={styles.suggestions}>
              {suggestions.map((suggestion) => (
                <div key={suggestion} className={styles.suggestion} onClick={() => selectSuggestion(suggestion)}>
                  {getSuggestionEl(suggestion).map((el, index) => {
                    if (el instanceof Object) {
                      return <span key={`${el.query}-${index}`}>{el.query}</span>;
                    }
                    return <Fragment key={`${el}-${index}`}>{el}</Fragment>;
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.suggestions}>
              <div className={styles.noData}>Nothing was found</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
