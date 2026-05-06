import { Router, Route, Switch } from 'wouter-preact';
import { useHashLocation } from 'wouter-preact/use-hash-location';
import { useLoading } from './hooks/useLoading';
import { ItemList } from './components/ItemList/ItemList';
import { RecipeList } from './components/Recipe/RecipeList';

export function App() {
  const {
    loading,
    error,
  } = useLoading();

  if (loading) {
    return (
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-400">Loading</div>
    );
  }

  if (error) {
    return (
      <div class="rounded-2xl border border-red-900/60 bg-red-950/40 p-6 text-red-200">{error}</div>
    );
  }

  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={ItemList} />
        <Route path="/item" component={ItemList} />
        <Route path="/item/:key" component={ItemList} />
        <Route path="/recipe" component={RecipeList} />
      </Switch>
    </Router>
  );
}
