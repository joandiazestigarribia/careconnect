import { type FamilySearchResult } from '../../../services/searchApi';
import FamilyCard from '../FamilyCard';
import SearchMap from '../SearchMap';
import { LoadingState, EmptyState, InitialState, ResultsHeader } from '../common/SearchStates';

interface Props {
  results: FamilySearchResult[];
  isLoading: boolean;
  isLoadingSaved: boolean;
  hasSearched: boolean;
  searchCenter: { lat: number; lng: number };
  searchRadius: number;
  error: string | null;
}

const FamilySearchResults = ({
  results,
  isLoading,
  isLoadingSaved,
  hasSearched,
  searchCenter,
  searchRadius,
  error,
}: Props) => {
  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
        <div className="w-5 h-5 text-red-500 shrink-0 mt-0.5">⚠</div>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasSearched && !isLoading && (
        <ResultsHeader 
          count={results.length} 
          radius={searchRadius} 
          type="families" 
        />
      )}

      {/* Mapa */}
      <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-border">
        <SearchMap
          familyResults={results}
          centerLat={searchCenter.lat}
          centerLng={searchCenter.lng}
          radiusKm={searchRadius}
          type="families"
        />
      </div>
      <p className="text-xs text-text-muted text-center -mt-4">
        Las ubicaciones mostradas son aproximadas para proteger la privacidad
      </p>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {results.map((result, index) => (
            <div 
              key={result.family.user_id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FamilyCard result={result} />
            </div>
          ))}
        </div>
      )}

      {/* Estados */}
      {hasSearched && results.length === 0 && !isLoading && (
        <EmptyState 
          title="No se encontraron familias"
          message="Intenta ampliar el radio de búsqueda o ajustar los filtros para encontrar más opciones."
          icon="users"
        />
      )}

      {!hasSearched && !isLoading && !isLoadingSaved && (
        <InitialState 
          title="¿Buscando familias para cuidar?"
          message="Configura tu ubicación y preferencias para encontrar familias que necesiten tus servicios."
        />
      )}

      {(isLoading || isLoadingSaved) && (
        <LoadingState 
          message="Buscando familias..."
          subMessage="Estamos analizando las mejores opciones para ti."
        />
      )}
    </div>
  );
};

export default FamilySearchResults;
