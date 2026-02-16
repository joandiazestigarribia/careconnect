import { type SearchResult } from '../../../services/searchApi';
import CaregiverCard from '../CaregiverCard';
import SearchMap from '../SearchMap';
import { LoadingState, EmptyState, InitialState, ResultsHeader } from '../common/SearchStates';

interface Props {
  results: SearchResult[];
  isLoading: boolean;
  isLoadingSaved: boolean;
  hasSearched: boolean;
  searchCenter: { lat: number; lng: number };
  searchRadius: number;
  error: string | null;
}

const CaregiverSearchResults = ({
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
          type="caregivers" 
        />
      )}

      {/* Mapa */}
      <div className="h-[570px] rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-border">
        <SearchMap
          results={results}
          centerLat={searchCenter.lat}
          centerLng={searchCenter.lng}
          radiusKm={searchRadius}
        />
      </div>
      <p className="text-xs text-text-muted text-center mt-2">
        Las ubicaciones mostradas son aproximadas para proteger la privacidad
      </p>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {results.map((result, index) => (
            <div 
              key={result.caregiver.user_id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CaregiverCard result={result} />
            </div>
          ))}
        </div>
      )}

      {/* Estados */}
      {hasSearched && results.length === 0 && !isLoading && (
        <EmptyState 
          title="No se encontraron cuidadores"
          message="Intenta ampliar el radio de búsqueda o ajustar los filtros para encontrar más opciones."
          icon="search"
        />
      )}

      {!hasSearched && !isLoading && !isLoadingSaved && (
        <InitialState 
          title="¿Listo para encontrar tu cuidador?"
          message="Configura tu ubicación y preferencias en el panel de búsqueda para comenzar."
        />
      )}

      {(isLoading || isLoadingSaved) && (
        <LoadingState 
          message="Buscando cuidadores..."
          subMessage="Estamos analizando las mejores opciones para ti."
        />
      )}
    </div>
  );
};

export default CaregiverSearchResults;
