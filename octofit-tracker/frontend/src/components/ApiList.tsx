import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type ApiListProps<T> = {
  title: string;
  description: string;
  endpoint: string;
  collection: string;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

type State<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: T[] };

function itemKey(item: unknown, index: number) {
  if (typeof item === 'object' && item !== null && '_id' in item) {
    const id = item._id;
    if (typeof id === 'string' || typeof id === 'number') return String(id);
  }
  return String(index);
}

export function ApiList<T>({ title, description, endpoint, collection, emptyMessage, renderItem }: ApiListProps<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<Record<string, unknown>>(endpoint)
      .then((response) => {
        const items = response[collection];
        if (!Array.isArray(items)) throw new Error('Unexpected response format');
        if (active) setState({ status: 'success', items: items as T[] });
      })
      .catch((error: unknown) => {
        if (active) setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Request failed',
        });
      });
    return () => { active = false; };
  }, [collection, endpoint]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'success' && state.items.length === 0 && <p>{emptyMessage}</p>}
        {state.status === 'success' && state.items.length > 0 && (
          <ul className="mb-0">
            {state.items.map((item, index) => <li key={itemKey(item, index)}>{renderItem(item)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}